#!/usr/bin/env python3
"""PNG visual smoke checks for ECGSIM screenshots."""

from __future__ import annotations

import argparse
from dataclasses import dataclass, asdict
import json
import math
from pathlib import Path
import struct
import zlib


PNG_SIGNATURE = b"\x89PNG\r\n\x1a\n"


class VisualRegressionError(ValueError):
    """Raised when a screenshot cannot pass visual smoke checks."""


@dataclass(frozen=True)
class PngMetrics:
    path: str
    width: int
    height: int
    mean_luma: float
    luma_stddev: float
    unique_sampled_colors: int
    edge_energy: float


def analyze_png(path: str | Path) -> PngMetrics:
    source_path = Path(path)
    width, height, color_type, bit_depth, palette, pixels = read_png_pixels(source_path)
    if bit_depth != 8:
        raise VisualRegressionError(f"{source_path} uses unsupported PNG bit depth {bit_depth}")
    rgb_pixels = pixels_to_rgb(pixels, color_type, palette)
    lumas = [luma(*pixel) for pixel in rgb_pixels]
    mean_luma = sum(lumas) / len(lumas)
    variance = sum((value - mean_luma) ** 2 for value in lumas) / len(lumas)
    unique_colors = sampled_unique_colors(rgb_pixels, width, height)
    return PngMetrics(
        path=source_path.as_posix(),
        width=width,
        height=height,
        mean_luma=round(mean_luma, 4),
        luma_stddev=round(math.sqrt(variance), 4),
        unique_sampled_colors=unique_colors,
        edge_energy=round(edge_energy(lumas, width, height), 4),
    )


def assert_visual_smoke(
    metrics: PngMetrics,
    *,
    min_width: int = 300,
    min_height: int = 200,
    min_luma_stddev: float = 8.0,
    min_unique_colors: int = 12,
    min_edge_energy: float = 2.0,
) -> None:
    if metrics.width < min_width or metrics.height < min_height:
        raise VisualRegressionError(
            f"{metrics.path} is too small ({metrics.width}x{metrics.height}, expected at least {min_width}x{min_height})"
        )
    if metrics.luma_stddev < min_luma_stddev:
        raise VisualRegressionError(
            f"{metrics.path} looks blank: luma stddev {metrics.luma_stddev} < {min_luma_stddev}"
        )
    if metrics.unique_sampled_colors < min_unique_colors:
        raise VisualRegressionError(
            f"{metrics.path} has too few sampled colors ({metrics.unique_sampled_colors} < {min_unique_colors})"
        )
    if metrics.edge_energy < min_edge_energy:
        raise VisualRegressionError(
            f"{metrics.path} has too little edge detail ({metrics.edge_energy} < {min_edge_energy})"
        )


def compare_visual_smoke(
    candidate: PngMetrics,
    reference: PngMetrics,
    *,
    max_aspect_delta: float = 0.75,
    max_mean_luma_delta: float = 85.0,
) -> dict[str, object]:
    aspect_candidate = candidate.width / candidate.height
    aspect_reference = reference.width / reference.height
    aspect_delta = abs(aspect_candidate - aspect_reference)
    mean_luma_delta = abs(candidate.mean_luma - reference.mean_luma)
    passed = aspect_delta <= max_aspect_delta and mean_luma_delta <= max_mean_luma_delta
    return {
        "status": "passed" if passed else "failed",
        "candidate": asdict(candidate),
        "reference": asdict(reference),
        "aspectDelta": round(aspect_delta, 4),
        "meanLumaDelta": round(mean_luma_delta, 4),
        "maxAspectDelta": max_aspect_delta,
        "maxMeanLumaDelta": max_mean_luma_delta,
        "message": (
            "visual smoke comparison passed"
            if passed
            else "visual smoke comparison failed broad aspect/luminance thresholds"
        ),
    }


def read_png_pixels(path: Path) -> tuple[int, int, int, int, list[tuple[int, int, int]], list[bytes]]:
    data = path.read_bytes()
    if not data.startswith(PNG_SIGNATURE):
        raise VisualRegressionError(f"{path} is not a PNG file")
    offset = len(PNG_SIGNATURE)
    width = height = color_type = bit_depth = None
    palette: list[tuple[int, int, int]] = []
    idat = bytearray()
    while offset < len(data):
        if offset + 8 > len(data):
            raise VisualRegressionError(f"{path} has a truncated PNG chunk")
        length = struct.unpack_from(">I", data, offset)[0]
        offset += 4
        chunk_type = data[offset : offset + 4]
        offset += 4
        chunk_data = data[offset : offset + length]
        offset += length + 4
        if chunk_type == b"IHDR":
            width, height, bit_depth, color_type = parse_ihdr(chunk_data, path)
        elif chunk_type == b"PLTE":
            palette = [
                tuple(chunk_data[index : index + 3])
                for index in range(0, len(chunk_data), 3)
                if index + 3 <= len(chunk_data)
            ]
        elif chunk_type == b"IDAT":
            idat.extend(chunk_data)
        elif chunk_type == b"IEND":
            break

    if width is None or height is None or color_type is None or bit_depth is None:
        raise VisualRegressionError(f"{path} is missing IHDR")
    channels = channels_for_color_type(color_type)
    row_size = width * channels
    raw = zlib.decompress(bytes(idat))
    expected = height * (row_size + 1)
    if len(raw) != expected:
        raise VisualRegressionError(f"{path} has unexpected decompressed size {len(raw)} != {expected}")
    return width, height, color_type, bit_depth, palette, unfilter_png(raw, width, height, channels)


def parse_ihdr(chunk_data: bytes, path: Path) -> tuple[int, int, int, int]:
    if len(chunk_data) != 13:
        raise VisualRegressionError(f"{path} has invalid IHDR size")
    width, height, bit_depth, color_type = struct.unpack_from(">IIBB", chunk_data, 0)
    if width <= 0 or height <= 0:
        raise VisualRegressionError(f"{path} has invalid dimensions {width}x{height}")
    return width, height, bit_depth, color_type


def channels_for_color_type(color_type: int) -> int:
    if color_type == 0:
        return 1
    if color_type == 2:
        return 3
    if color_type == 3:
        return 1
    if color_type == 4:
        return 2
    if color_type == 6:
        return 4
    raise VisualRegressionError(f"unsupported PNG color type {color_type}")


def unfilter_png(raw: bytes, width: int, height: int, channels: int) -> list[bytes]:
    rows: list[bytes] = []
    row_size = width * channels
    previous = bytes(row_size)
    offset = 0
    for _row in range(height):
        filter_type = raw[offset]
        offset += 1
        current = bytearray(raw[offset : offset + row_size])
        offset += row_size
        for index, value in enumerate(current):
            left = current[index - channels] if index >= channels else 0
            up = previous[index]
            up_left = previous[index - channels] if index >= channels else 0
            if filter_type == 1:
                current[index] = (value + left) & 0xFF
            elif filter_type == 2:
                current[index] = (value + up) & 0xFF
            elif filter_type == 3:
                current[index] = (value + ((left + up) // 2)) & 0xFF
            elif filter_type == 4:
                current[index] = (value + paeth(left, up, up_left)) & 0xFF
            elif filter_type != 0:
                raise VisualRegressionError(f"unsupported PNG filter type {filter_type}")
        row = bytes(current)
        rows.append(row)
        previous = row
    return rows


def pixels_to_rgb(
    rows: list[bytes], color_type: int, palette: list[tuple[int, int, int]]
) -> list[tuple[int, int, int]]:
    pixels: list[tuple[int, int, int]] = []
    for row in rows:
        if color_type == 0:
            pixels.extend((value, value, value) for value in row)
        elif color_type == 2:
            pixels.extend(tuple(row[index : index + 3]) for index in range(0, len(row), 3))
        elif color_type == 3:
            pixels.extend(palette[value] if value < len(palette) else (0, 0, 0) for value in row)
        elif color_type == 4:
            pixels.extend((row[index], row[index], row[index]) for index in range(0, len(row), 2))
        elif color_type == 6:
            pixels.extend(tuple(row[index : index + 3]) for index in range(0, len(row), 4))
    return pixels


def sampled_unique_colors(pixels: list[tuple[int, int, int]], width: int, height: int) -> int:
    x_step = max(1, width // 64)
    y_step = max(1, height // 64)
    colors = set()
    for y in range(0, height, y_step):
        row_offset = y * width
        for x in range(0, width, x_step):
            colors.add(pixels[row_offset + x])
    return len(colors)


def edge_energy(lumas: list[float], width: int, height: int) -> float:
    x_step = max(1, width // 64)
    y_step = max(1, height // 64)
    diffs = []
    for y in range(0, height - y_step, y_step):
        row_offset = y * width
        next_row_offset = (y + y_step) * width
        for x in range(0, width - x_step, x_step):
            index = row_offset + x
            diffs.append(abs(lumas[index] - lumas[index + x_step]))
            diffs.append(abs(lumas[index] - lumas[next_row_offset + x]))
    return sum(diffs) / len(diffs) if diffs else 0.0


def luma(red: int, green: int, blue: int) -> float:
    return 0.2126 * red + 0.7152 * green + 0.0722 * blue


def paeth(left: int, up: int, up_left: int) -> int:
    estimate = left + up - up_left
    left_distance = abs(estimate - left)
    up_distance = abs(estimate - up)
    up_left_distance = abs(estimate - up_left)
    if left_distance <= up_distance and left_distance <= up_left_distance:
        return left
    if up_distance <= up_left_distance:
        return up
    return up_left


def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("candidate", type=Path)
    parser.add_argument("--reference", type=Path)
    parser.add_argument("--output", type=Path)
    return parser


def main(argv: list[str] | None = None) -> int:
    args = build_parser().parse_args(argv)
    candidate = analyze_png(args.candidate)
    try:
        assert_visual_smoke(candidate)
        if args.reference:
            reference = analyze_png(args.reference)
            assert_visual_smoke(reference)
            report = compare_visual_smoke(candidate, reference)
        else:
            report = {"status": "passed", "candidate": asdict(candidate)}
    except VisualRegressionError as exc:
        report = {"status": "failed", "candidate": asdict(candidate), "message": str(exc)}
    text = json.dumps(report, indent=2)
    if args.output:
        args.output.write_text(text + "\n", encoding="utf-8")
    print(text)
    return 0 if report["status"] == "passed" else 1


if __name__ == "__main__":
    raise SystemExit(main())
