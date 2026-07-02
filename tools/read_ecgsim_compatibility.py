#!/usr/bin/env python3
"""Smoke-check a modern export against MATLAB readECGsim.m expectations."""

from __future__ import annotations

import argparse
import json
from pathlib import Path
import sys
import tempfile


ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT))

from ecgsim.io import export_case_directory, read_geometry, read_matrix


READ_ECGSIM_REQUIRED_PATHS = (
    "model/ventricle.tri",
    "model/ventricle.adj2d",
    "model/ventricle.adj3d",
    "model/ventricle.dst2d",
    "model/ventricle.dst3d",
    "model/ventricle.adjanis",
    "model/ventricle.dstanis",
    "model/ventricles2Thorax.mat",
    "model/ventricles2atria.mat",
    "model/ventricles2Ventricles.mat",
    "model/ventricles2RLung.mat",
    "model/ventricles2LLung.mat",
    "model/ventricles2LCavity.mat",
    "model/ventricles2RCavity.mat",
    "model/ventricles2standard12lead.mat",
    "model/lcav.tri",
    "model/rcav.tri",
    "model/llung.tri",
    "model/rlung.tri",
    "model/thorax.tri",
)


def read_ecgsim_compatibility_report(export_dir: Path) -> dict[str, object]:
    """Return a machine-readable report for a modern export directory."""

    export_dir = export_dir.resolve()
    written_files = sorted(path for path in export_dir.rglob("*") if path.is_file())
    readable = []
    unreadable = []

    for path in written_files:
        relative = path.relative_to(export_dir).as_posix()
        if relative == "metadata.json":
            continue
        try:
            if path.suffix == ".tri":
                geometry = read_geometry(path)
                readable.append(
                    {
                        "path": relative,
                        "reader": "loadtri-compatible-ascii",
                        "rows": geometry.point_count,
                        "columns": 3,
                    }
                )
            else:
                matrix = read_matrix(path)
                readable.append(
                    {
                        "path": relative,
                        "reader": "loadmat-compatible-ascii",
                        "rows": matrix.rows,
                        "columns": matrix.columns,
                    }
                )
        except Exception as exc:
            unreadable.append({"path": relative, "message": str(exc)})

    required = [
        {"path": path, "present": (export_dir / path).exists()}
        for path in READ_ECGSIM_REQUIRED_PATHS
    ]
    required.extend(electrode_requirements(export_dir))
    missing_required = [item["path"] for item in required if not item["present"]]

    return {
        "schema": "org.ecgsim.read-ecgsim-compatibility",
        "version": 1,
        "exportDir": export_dir.as_posix(),
        "status": "full" if not missing_required and not unreadable else "partial",
        "readableCount": len(readable),
        "unreadableCount": len(unreadable),
        "missingRequiredCount": len(missing_required),
        "readableFiles": readable,
        "unreadableFiles": unreadable,
        "requiredFiles": required,
        "notes": [
            "Readable files are checked with Python readers matching loadmat.m/loadtri.m ASCII conventions.",
            "Full readECGsim.m compatibility requires all requiredFiles plus a MATLAB or Octave runtime check.",
        ],
    }


def electrode_requirements(export_dir: Path) -> list[dict[str, object]]:
    requirements = []
    ecg_dir = export_dir / "ecgs"
    if not ecg_dir.exists():
        return requirements
    for ecg_file in sorted(ecg_dir.glob("*.refECG")):
        electrode_name = f"{ecg_file.name[:-6]}elec"
        requirements.append(
            {
                "path": f"ecgs/{electrode_name}",
                "present": (ecg_dir / electrode_name).exists(),
                "source": ecg_file.name,
            }
        )
    return requirements


def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument(
        "export_dir",
        type=Path,
        nargs="?",
        help="Existing export directory to check. Omit when using --case.",
    )
    parser.add_argument("--case", type=Path, help="Generate a temporary modern export from this case file.")
    parser.add_argument("--output", type=Path, help="Optional JSON report path.")
    parser.add_argument("--require-full", action="store_true", help="Exit non-zero unless full readECGsim loading should work.")
    return parser


def main(argv: list[str] | None = None) -> int:
    args = build_parser().parse_args(argv)
    if args.export_dir is None and args.case is None:
        raise SystemExit("pass an export_dir or --case")
    if args.export_dir is not None and args.case is not None:
        raise SystemExit("pass either export_dir or --case, not both")

    if args.case is not None:
        with tempfile.TemporaryDirectory() as tmp:
            export_dir = Path(tmp) / "modern-export"
            export_case_directory(args.case, export_dir)
            report = read_ecgsim_compatibility_report(export_dir)
            emit_report(report, args.output)
            return 0 if report["status"] == "full" or not args.require_full else 1

    report = read_ecgsim_compatibility_report(args.export_dir)
    emit_report(report, args.output)
    return 0 if report["status"] == "full" or not args.require_full else 1


def emit_report(report: dict[str, object], output: Path | None) -> None:
    text = json.dumps(report, indent=2)
    if output is not None:
        output.write_text(text + "\n", encoding="utf-8")
    print(text)


if __name__ == "__main__":
    raise SystemExit(main())
