"""Modern ECG signal import format reader."""

from __future__ import annotations

from dataclasses import dataclass
import json
from pathlib import Path
from typing import Any


ECG_SIGNAL_SCHEMA = "org.ecgsim.ecg-signals"
ECG_SIGNAL_VERSION = 1


class ECGSignalImportError(ValueError):
    """Raised when an imported ECG signal file is invalid."""


@dataclass(frozen=True)
class ImportedECGSignals:
    """External ECG traces loaded for comparison/display."""

    name: str
    sample_rate_hz: float
    units: str
    lead_labels: tuple[str, ...]
    values_by_lead: tuple[tuple[float, ...], ...]
    source_path: Path | None = None

    @property
    def rows(self) -> int:
        return len(self.values_by_lead)

    @property
    def columns(self) -> int:
        return len(self.values_by_lead[0]) if self.values_by_lead else 0


def read_ecg_signals(path: str | Path) -> ImportedECGSignals:
    """Read an external ECG signal JSON file."""

    source_path = Path(path)
    try:
        payload = json.loads(source_path.read_text(encoding="utf-8"))
    except OSError as exc:
        raise ECGSignalImportError(f"{source_path} could not be read: {exc}") from exc
    except json.JSONDecodeError as exc:
        raise ECGSignalImportError(f"{source_path} is not valid JSON: {exc.msg}") from exc
    return validate_ecg_signal_payload(payload, source_path=source_path)


def validate_ecg_signal_payload(
    payload: Any,
    *,
    source_path: Path | None = None,
) -> ImportedECGSignals:
    """Validate and normalize the modern ECG signal import schema."""

    if not isinstance(payload, dict) or isinstance(payload, list):
        raise ECGSignalImportError("ECG signal import must be a JSON object")
    if payload.get("schema") != ECG_SIGNAL_SCHEMA:
        raise ECGSignalImportError(f"schema must be {ECG_SIGNAL_SCHEMA!r}")
    if payload.get("version") != ECG_SIGNAL_VERSION:
        raise ECGSignalImportError(f"version must be {ECG_SIGNAL_VERSION}")

    name = _required_string(payload, "name")
    units = _required_string(payload, "units")
    sample_rate_hz = _required_positive_number(payload, "sampleRateHz")
    lead_labels = _required_string_list(payload, "leadLabels")
    values_by_lead = _required_numeric_matrix(payload, "valuesByLead")

    if len(lead_labels) != len(values_by_lead):
        raise ECGSignalImportError("leadLabels length must match valuesByLead rows")

    return ImportedECGSignals(
        name=name,
        sample_rate_hz=sample_rate_hz,
        units=units,
        lead_labels=tuple(lead_labels),
        values_by_lead=tuple(tuple(row) for row in values_by_lead),
        source_path=source_path,
    )


def _required_string(payload: dict[str, Any], key: str) -> str:
    value = payload.get(key)
    if not isinstance(value, str) or not value.strip():
        raise ECGSignalImportError(f"{key} must be a non-empty string")
    return value.strip()


def _required_positive_number(payload: dict[str, Any], key: str) -> float:
    value = payload.get(key)
    if not isinstance(value, (int, float)) or isinstance(value, bool) or value <= 0:
        raise ECGSignalImportError(f"{key} must be a positive number")
    return float(value)


def _required_string_list(payload: dict[str, Any], key: str) -> list[str]:
    value = payload.get(key)
    if not isinstance(value, list) or not value:
        raise ECGSignalImportError(f"{key} must be a non-empty array")
    labels: list[str] = []
    for index, item in enumerate(value):
        if not isinstance(item, str) or not item.strip():
            raise ECGSignalImportError(f"{key}[{index}] must be a non-empty string")
        labels.append(item.strip())
    return labels


def _required_numeric_matrix(payload: dict[str, Any], key: str) -> list[list[float]]:
    value = payload.get(key)
    if not isinstance(value, list) or not value:
        raise ECGSignalImportError(f"{key} must be a non-empty matrix")

    rows: list[list[float]] = []
    expected_columns: int | None = None
    for row_index, row in enumerate(value):
        if not isinstance(row, list) or not row:
            raise ECGSignalImportError(f"{key}[{row_index}] must be a non-empty numeric row")
        numeric_row: list[float] = []
        for column_index, item in enumerate(row):
            if not isinstance(item, (int, float)) or isinstance(item, bool):
                raise ECGSignalImportError(f"{key}[{row_index}][{column_index}] must be numeric")
            numeric_row.append(float(item))
        if expected_columns is None:
            expected_columns = len(numeric_row)
        elif len(numeric_row) != expected_columns:
            raise ECGSignalImportError(f"{key} rows must all have the same length")
        rows.append(numeric_row)
    return rows
