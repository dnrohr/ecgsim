"""Transmembrane potential waveform generation."""

from __future__ import annotations

from dataclasses import dataclass
import math
from pathlib import Path
import struct
from typing import Mapping, Sequence


@dataclass(frozen=True)
class TMPParameters:
    """Parameters used to generate one source-node TMP waveform."""

    depolarization_ms: float
    repolarization_ms: float
    resting_potential: float
    amplitude: float
    plateau_slope: float
    repolarization_slope: float
    depolarization_slope: float = 0.001


LEGACY_REPOLARIZATION_RATE_SCALE = 0.56
LEGACY_REPOLARIZATION_SHAPE_SCALE = 2.75
LEGACY_REPOLARIZATION_START_DEP_WIDTHS = 3.0


def generate_tmp_waveform(
    parameters: TMPParameters,
    sample_count: int,
    sample_rate_hz: float = 1000.0,
    *,
    precision: int | None = 6,
) -> list[float]:
    """Generate one legacy-calibrated TMP waveform from source parameters.

    The archived ECGSIM manual documents parameter meanings but not the original
    curve equation. This implementation is calibrated against the first captured
    ECGSIM 3.0.1 `.user.source` matrix: a logistic upstroke centered on the
    depolarization time and a Gompertz-style repolarization envelope.
    """

    if sample_count < 0:
        raise ValueError("sample_count must be non-negative")
    if sample_rate_hz <= 0.0 or not math.isfinite(sample_rate_hz):
        raise ValueError("sample_rate_hz must be a positive finite number")
    _validate_parameters(parameters)

    dep_rate = _depolarization_rate(parameters.depolarization_slope)
    rep_rate = max(abs(parameters.repolarization_slope), 1e-9)
    plateau_rate = max(abs(parameters.plateau_slope), 0.0)
    rep_envelope_rate = rep_rate * LEGACY_REPOLARIZATION_RATE_SCALE
    rep_shape = (plateau_rate / rep_rate) * LEGACY_REPOLARIZATION_SHAPE_SCALE
    rep_start_ms = (
        parameters.depolarization_ms
        + LEGACY_REPOLARIZATION_START_DEP_WIDTHS / dep_rate
    )
    rep_start_exponent = _safe_exp(
        rep_envelope_rate * (rep_start_ms - parameters.repolarization_ms)
    )
    sample_period_ms = 1000.0 / sample_rate_hz
    active_range = parameters.amplitude - parameters.resting_potential

    values: list[float] = []
    for sample in range(sample_count):
        time_ms = sample * sample_period_ms
        upstroke = _sigmoid((time_ms - parameters.depolarization_ms) * dep_rate)
        rep_exponent = _safe_exp(
            rep_envelope_rate * (time_ms - parameters.repolarization_ms)
        )
        repolarization = _safe_exp(-rep_shape * (rep_exponent - rep_start_exponent))
        value = parameters.resting_potential + active_range * upstroke * repolarization
        values.append(round(value, precision) if precision is not None else value)
    return values


def generate_tmp_waveform_from_vectors(
    parameter_vectors: Mapping[str, Mapping[str, Sequence[float]]],
    node_index: int,
    state: str,
    sample_count: int,
    sample_rate_hz: float = 1000.0,
    *,
    precision: int | None = 6,
) -> list[float]:
    """Generate one TMP waveform from named initial/adapted parameter vectors."""

    parameters = tmp_parameters_from_vectors(parameter_vectors, node_index, state)
    return generate_tmp_waveform(parameters, sample_count, sample_rate_hz, precision=precision)


def generate_tmp_matrix_from_vectors(
    parameter_vectors: Mapping[str, Mapping[str, Sequence[float]]],
    state: str,
    sample_count: int,
    sample_rate_hz: float = 1000.0,
    *,
    precision: int | None = 6,
) -> tuple[tuple[float, ...], ...]:
    """Generate source-node-by-time TMP waveforms from named parameter vectors."""

    node_count = len(parameter_vectors["depolarizationMs"][state])
    return tuple(
        tuple(
            generate_tmp_waveform_from_vectors(
                parameter_vectors,
                node_index,
                state,
                sample_count,
                sample_rate_hz,
                precision=precision,
            )
        )
        for node_index in range(node_count)
    )


def read_legacy_tmp_source_matrix(path: str | Path) -> tuple[tuple[float, ...], ...]:
    """Read an exported ECGSIM `.user.source` matrix as source-node rows.

    Legacy raw matrix exports used by `read_matrix()` are generally column-major,
    but captured `.user.source` files store each source node as one contiguous
    row after the `int32 rows, int32 columns` header.
    """

    source_path = Path(path)
    data = source_path.read_bytes()
    if len(data) < 8:
        raise ValueError(f"{source_path} is too short for a TMP source matrix")
    rows, columns = struct.unpack_from("<ii", data, 0)
    if rows <= 0 or columns <= 0:
        raise ValueError(f"{source_path} has invalid TMP source shape {rows}x{columns}")
    expected_bytes = 8 + rows * columns * 4
    if len(data) != expected_bytes:
        raise ValueError(
            f"{source_path} expected {expected_bytes} bytes for {rows}x{columns} TMP source matrix, "
            f"found {len(data)}"
        )
    flat = struct.unpack_from(f"<{rows * columns}f", data, 8)
    return tuple(
        tuple(float(flat[row * columns + column]) for column in range(columns))
        for row in range(rows)
    )


def tmp_parameters_from_vectors(
    parameter_vectors: Mapping[str, Mapping[str, Sequence[float]]],
    node_index: int,
    state: str,
) -> TMPParameters:
    """Build `TMPParameters` from ECGSIM-style named parameter vectors."""

    return TMPParameters(
        depolarization_ms=_vector_value(
            parameter_vectors, "depolarizationMs", state, node_index
        ),
        repolarization_ms=_vector_value(
            parameter_vectors, "repolarizationMs", state, node_index
        ),
        resting_potential=_vector_value(
            parameter_vectors, "restingPotential", state, node_index
        ),
        amplitude=_vector_value(parameter_vectors, "amplitude", state, node_index),
        plateau_slope=_vector_value(parameter_vectors, "plateauSlope", state, node_index),
        depolarization_slope=_vector_value(
            parameter_vectors, "depolarizationSlope", state, node_index
        ),
        repolarization_slope=_vector_value(
            parameter_vectors, "repolarizationSlope", state, node_index
        ),
    )


def _vector_value(
    parameter_vectors: Mapping[str, Mapping[str, Sequence[float]]],
    parameter: str,
    state: str,
    node_index: int,
) -> float:
    try:
        value = parameter_vectors[parameter][state][node_index]
    except KeyError as exc:
        raise KeyError(f"missing TMP parameter vector {parameter!r} for state {state!r}") from exc
    except IndexError as exc:
        raise IndexError(f"node index {node_index} is outside TMP parameter vector {parameter!r}") from exc
    return float(value)


def _validate_parameters(parameters: TMPParameters) -> None:
    for name, value in parameters.__dict__.items():
        if not math.isfinite(value):
            raise ValueError(f"{name} must be finite")


def _sigmoid(value: float) -> float:
    if value < -60.0:
        return 0.0
    if value > 60.0:
        return 1.0
    return 1.0 / (1.0 + math.exp(-value))


def _safe_exp(value: float) -> float:
    if value < -60.0:
        return math.exp(-60.0)
    if value > 60.0:
        return math.exp(60.0)
    return math.exp(value)


def _depolarization_rate(depolarization_slope: float) -> float:
    slope = max(abs(depolarization_slope), 1e-9)
    if slope >= 1.0:
        return slope
    return 1.0 / max(slope * 1000.0, 1e-9)
