"""Modern source-parameter interchange for ECGSIM source info workflows."""

from __future__ import annotations

from pathlib import Path
import json
from typing import Any

from ecgsim.io.ecgsimcase import ECGsimCase, ECGsimCaseSource, load_case


SOURCE_INFO_SCHEMA = "org.ecgsim.source-info"
SOURCE_INFO_VERSION = 1


class SourceInfoError(ValueError):
    """Raised when source-info interchange data is invalid or incompatible."""


def source_info_from_case(case: ECGsimCase) -> dict[str, Any]:
    """Build a validated modern source-info payload from a parsed case."""

    return {
        "schema": SOURCE_INFO_SCHEMA,
        "version": SOURCE_INFO_VERSION,
        "case": {
            "fileName": case.metadata.source_path.name,
            "sha256": case.metadata.sha256,
            "byteSize": case.metadata.byte_size,
        },
        "format": {
            "legacyExtension": ".ECGsimsource",
            "legacyCompatibility": "not-byte-compatible; legacy file structure is undocumented",
            "interpretation": (
                "Modern source-info JSON preserving parsed initial and adapted source-parameter vectors. "
                "Use this as a safe interchange path until real .ECGsimsource fixtures define the legacy format."
            ),
        },
        "sources": [_source_payload(source) for source in case.sources],
    }


def read_source_info(path: str | Path) -> dict[str, Any]:
    """Read and validate a modern source-info JSON payload."""

    payload = json.loads(Path(path).read_text(encoding="utf-8"))
    validate_source_info(payload)
    return payload


def write_source_info(path: str | Path, payload: dict[str, Any]) -> None:
    """Validate and write modern source-info JSON."""

    validate_source_info(payload)
    target = Path(path)
    target.parent.mkdir(parents=True, exist_ok=True)
    target.write_text(json.dumps(payload, indent=2, sort_keys=True) + "\n", encoding="utf-8")


def export_case_source_info(case_path: str | Path, output_path: str | Path) -> dict[str, Any]:
    """Parse a case and write its source-info payload."""

    payload = source_info_from_case(load_case(case_path))
    write_source_info(output_path, payload)
    return payload


def validate_source_info(payload: Any, *, expected_sha256: str | None = None) -> None:
    """Validate source-info schema, vector lengths, and optional case identity."""

    if not isinstance(payload, dict):
        raise SourceInfoError("source-info payload must be an object")
    if payload.get("schema") != SOURCE_INFO_SCHEMA or payload.get("version") != SOURCE_INFO_VERSION:
        raise SourceInfoError("source-info schema or version is unsupported")
    case = payload.get("case")
    if not isinstance(case, dict) or not case.get("fileName") or not case.get("sha256"):
        raise SourceInfoError("source-info case identity is incomplete")
    if expected_sha256 and case["sha256"] != expected_sha256:
        raise SourceInfoError("source-info belongs to a different case")
    sources = payload.get("sources")
    if not isinstance(sources, list) or not sources:
        raise SourceInfoError("source-info must include one or more sources")
    for source in sources:
        _validate_source(source)


def _source_payload(source: ECGsimCaseSource) -> dict[str, Any]:
    return {
        "id": source.id,
        "kind": source.kind,
        "sourceOffset": source.source_offset,
        "beats": [
            {
                "id": beat.id,
                "parameters": {
                    parameter.name: {
                        "units": parameter.units,
                        "initial": list(parameter.initial.values) if parameter.initial else [],
                        "adapted": list(parameter.adapted.values) if parameter.adapted else [],
                    }
                    for parameter in beat.parameters
                },
            }
            for beat in source.beats
        ],
    }


def _validate_source(source: Any) -> None:
    if not isinstance(source, dict) or not source.get("id") or not source.get("kind"):
        raise SourceInfoError("source entry is missing id or kind")
    beats = source.get("beats")
    if not isinstance(beats, list) or not beats:
        raise SourceInfoError(f"source {source.get('id', '<unknown>')} has no beats")
    for beat in beats:
        if not isinstance(beat, dict) or not beat.get("id"):
            raise SourceInfoError("source beat is missing id")
        parameters = beat.get("parameters")
        if not isinstance(parameters, dict) or not parameters:
            raise SourceInfoError(f"source beat {beat.get('id')} has no parameters")
        expected_length = None
        for name, parameter in parameters.items():
            if not isinstance(parameter, dict):
                raise SourceInfoError(f"parameter {name} must be an object")
            initial = parameter.get("initial")
            adapted = parameter.get("adapted")
            if not isinstance(initial, list) or not isinstance(adapted, list):
                raise SourceInfoError(f"parameter {name} must include initial and adapted vectors")
            if len(initial) != len(adapted):
                raise SourceInfoError(f"parameter {name} initial/adapted lengths differ")
            if expected_length is None:
                expected_length = len(adapted)
            elif len(adapted) != expected_length:
                raise SourceInfoError(f"parameter {name} length does not match source node count")
            if any(not isinstance(value, (int, float)) for value in initial + adapted):
                raise SourceInfoError(f"parameter {name} contains non-numeric values")
