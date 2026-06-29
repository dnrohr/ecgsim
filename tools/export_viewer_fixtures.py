#!/usr/bin/env python3
"""Export small viewer fixtures from archived ECGSIM source data."""

from __future__ import annotations

import json
from pathlib import Path
import sys

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT))

from ecgsim.io import read_geometry


GEOMETRY_SOURCE_DIR = ROOT / "research/source/www.ecgsim.org/downloads/other13/geometry"
HEART_SOURCE = GEOMETRY_SOURCE_DIR / "heart.tri"
HEART_TARGET = ROOT / "app/viewer/public/fixtures/heart.json"
THORAX_TARGET = ROOT / "app/viewer/public/fixtures/thorax.json"


def geometry_payload(source: Path) -> dict[str, object]:
    geometry = read_geometry(source)
    return {
        "source": str(source.relative_to(ROOT)).replace("\\", "/"),
        "units": geometry.units,
        "pointCount": geometry.point_count,
        "triangleCount": geometry.triangle_count,
        "points": geometry.points,
        "triangles": geometry.triangles,
    }


def main() -> int:
    HEART_TARGET.parent.mkdir(parents=True, exist_ok=True)
    HEART_TARGET.write_text(
        json.dumps(geometry_payload(HEART_SOURCE), separators=(",", ":"))
        + "\n",
        encoding="utf-8",
    )
    print(f"wrote {HEART_TARGET.relative_to(ROOT)}")
    THORAX_TARGET.write_text(
        json.dumps(
            {
                "meshes": {
                    "thorax": geometry_payload(GEOMETRY_SOURCE_DIR / "thorax.tri"),
                    "leftLung": geometry_payload(GEOMETRY_SOURCE_DIR / "llung.tri"),
                    "rightLung": geometry_payload(GEOMETRY_SOURCE_DIR / "rlung.tri"),
                }
            },
            separators=(",", ":"),
        )
        + "\n",
        encoding="utf-8",
    )
    print(f"wrote {THORAX_TARGET.relative_to(ROOT)}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
