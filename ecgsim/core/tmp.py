"""Transmembrane potential waveform generation."""

from __future__ import annotations

from dataclasses import dataclass
import math
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


def generate_tmp_waveform(
    parameters: TMPParameters,
    sample_count: int,
    sample_rate_hz: float = 1000.0,
    *,
    precision: int | None = 6,
) -> list[float]:
    """Generate one provisional TMP waveform from source parameters.

    The archived ECGSIM material documents the parameter meanings but not the
    exact legacy curve generator. This implementation intentionally matches the
    project's current documented preview model until exported `.user.source`
    parity data is available.
    """

    if sample_count < 0:
        raise ValueError("sample_count must be non-negative")
    if sample_rate_hz <= 0.0 or not math.isfinite(sample_rate_hz):
        raise ValueError("sample_rate_hz must be a positive finite number")
    _validate_parameters(parameters)

    dep_width_ms = max(parameters.depolarization_slope * 1000.0, 1.0)
    rep_width_ms = max(parameters.repolarization_slope * 1000.0, 1.0)
    sample_period_ms = 1000.0 / sample_rate_hz

    values: list[float] = []
    for sample in range(sample_count):
        time_ms = sample * sample_period_ms
        upstroke = _sigmoid((time_ms - parameters.depolarization_ms) / dep_width_ms)
        recovery = _sigmoid((time_ms - parameters.repolarization_ms) / rep_width_ms)
        plateau_decay = (
            max(0.0, time_ms - parameters.depolarization_ms)
            * parameters.plateau_slope
            / 1000.0
        )
        active_amplitude = max(0.0, parameters.amplitude - plateau_decay)
        value = parameters.resting_potential + active_amplitude * upstroke * (1.0 - recovery)
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
