#!/usr/bin/env python3
"""Validate curated legacy visual reference manifests."""

from __future__ import annotations

import argparse
import hashlib
import json
import math
from pathlib import Path
import sys
from typing import Any

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from tools.visual_regression import (
    VisualRegressionError,
    luma,
    pixels_to_rgb,
    read_png_pixels,
)


def validate_manifest(path: Path) -> dict[str, Any]:
    manifest = json.loads(path.read_text(encoding="utf-8"))
    root = path.parent.parent.parent if path.as_posix().endswith("research/legacy-exports/curated-pane-references.json") else Path.cwd()
    references = manifest.get("references")
    if not isinstance(references, list) or not references:
        raise VisualRegressionError("manifest must include at least one reference")

    validated: list[dict[str, Any]] = []
    for reference in references:
        validated.append(validate_reference(reference, root))

    return {
        "status": "passed",
        "manifest": path.as_posix(),
        "referenceCount": len(validated),
        "regionCount": sum(len(item["regions"]) for item in validated),
        "references": validated,
    }


def validate_reference(reference: dict[str, Any], root: Path) -> dict[str, Any]:
    image_path = root / reference["image"]
    if not image_path.exists():
        raise VisualRegressionError(f"{image_path} does not exist")
    checksum = hashlib.sha256(image_path.read_bytes()).hexdigest()
    if checksum != reference.get("sha256"):
        raise VisualRegressionError(f"{image_path} checksum mismatch: {checksum} != {reference.get('sha256')}")

    width, height, color_type, bit_depth, palette, rows = read_png_pixels(image_path)
    if bit_depth != 8:
        raise VisualRegressionError(f"{image_path} uses unsupported PNG bit depth {bit_depth}")
    if width != reference.get("width") or height != reference.get("height"):
        raise VisualRegressionError(
            f"{image_path} dimensions {width}x{height} do not match manifest {reference.get('width')}x{reference.get('height')}"
        )
    rgb_pixels = pixels_to_rgb(rows, color_type, palette)
    regions = [validate_region(region, rgb_pixels, width, height) for region in reference.get("regions", [])]
    if not regions:
        raise VisualRegressionError(f"{reference.get('id')} must include at least one region")
    return {
        "id": reference["id"],
        "image": reference["image"],
        "width": width,
        "height": height,
        "regions": regions,
    }


def validate_region(region: dict[str, Any], pixels: list[tuple[int, int, int]], image_width: int, image_height: int) -> dict[str, Any]:
    x = int(region["x"])
    y = int(region["y"])
    width = int(region["width"])
    height = int(region["height"])
    if width < 100 or height < 100:
        raise VisualRegressionError(f"{region.get('id')} is too small ({width}x{height})")
    if x < 0 or y < 0 or x + width > image_width or y + height > image_height:
        raise VisualRegressionError(f"{region.get('id')} is outside the source image bounds")

    sample_pixels = []
    x_step = max(1, width // 96)
    y_step = max(1, height // 96)
    for row in range(y, y + height, y_step):
        row_offset = row * image_width
        for column in range(x, x + width, x_step):
            sample_pixels.append(pixels[row_offset + column])
    lumas = [luma(*pixel) for pixel in sample_pixels]
    mean_luma = sum(lumas) / len(lumas)
    variance = sum((value - mean_luma) ** 2 for value in lumas) / len(lumas)
    unique_colors = len(set(sample_pixels))
    edge = sampled_edge_energy(sample_pixels, max(1, math.ceil(width / x_step)), max(1, math.ceil(height / y_step)))

    luma_stddev = math.sqrt(variance)
    if luma_stddev < 2.0:
        raise VisualRegressionError(f"{region.get('id')} looks blank: luma stddev {luma_stddev:.4f} < 2.0")
    if unique_colors < 8:
        raise VisualRegressionError(f"{region.get('id')} has too few sampled colors: {unique_colors} < 8")
    if edge < 0.5:
        raise VisualRegressionError(f"{region.get('id')} has too little edge detail: {edge:.4f} < 0.5")

    return {
        "id": region["id"],
        "pane": region["pane"],
        "bounds": {"x": x, "y": y, "width": width, "height": height},
        "meanLuma": round(mean_luma, 4),
        "lumaStddev": round(luma_stddev, 4),
        "uniqueSampledColors": unique_colors,
        "edgeEnergy": round(edge, 4),
    }


def sampled_edge_energy(pixels: list[tuple[int, int, int]], width: int, height: int) -> float:
    lumas = [luma(*pixel) for pixel in pixels]
    diffs = []
    for y in range(height - 1):
        row_offset = y * width
        next_row_offset = (y + 1) * width
        for x in range(width - 1):
            index = row_offset + x
            diffs.append(abs(lumas[index] - lumas[index + 1]))
            diffs.append(abs(lumas[index] - lumas[next_row_offset + x]))
    return sum(diffs) / len(diffs) if diffs else 0.0


def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("manifest", type=Path)
    parser.add_argument("--output", type=Path)
    return parser


def main(argv: list[str] | None = None) -> int:
    args = build_parser().parse_args(argv)
    try:
        report = validate_manifest(args.manifest)
    except VisualRegressionError as exc:
        report = {"status": "failed", "manifest": args.manifest.as_posix(), "message": str(exc)}
    text = json.dumps(report, indent=2)
    if args.output:
        args.output.write_text(text + "\n", encoding="utf-8")
    print(text)
    return 0 if report["status"] == "passed" else 1


if __name__ == "__main__":
    raise SystemExit(main())
