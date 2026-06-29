#!/usr/bin/env python3
"""Export small viewer fixtures from archived ECGSIM source data."""

from __future__ import annotations

import json
from pathlib import Path
import sys

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT))

from ecgsim.io import read_geometry


HEART_SOURCE = ROOT / "research/source/www.ecgsim.org/downloads/other13/geometry/heart.tri"
HEART_TARGET = ROOT / "app/viewer/public/fixtures/heart.json"


def main() -> int:
    geometry = read_geometry(HEART_SOURCE)
    HEART_TARGET.parent.mkdir(parents=True, exist_ok=True)
    HEART_TARGET.write_text(
        json.dumps(
            {
                "source": str(HEART_SOURCE.relative_to(ROOT)).replace("\\", "/"),
                "units": geometry.units,
                "pointCount": geometry.point_count,
                "triangleCount": geometry.triangle_count,
                "points": geometry.points,
                "triangles": geometry.triangles,
            },
            separators=(",", ":"),
        )
        + "\n",
        encoding="utf-8",
    )
    print(f"wrote {HEART_TARGET.relative_to(ROOT)}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
