from pathlib import Path
import struct
import tempfile
import unittest
import zlib

from tools.visual_regression import (
    VisualRegressionError,
    analyze_png,
    assert_visual_smoke,
    compare_visual_smoke,
)


class VisualRegressionTests(unittest.TestCase):
    def test_tracked_legacy_screenshot_passes_visual_smoke(self) -> None:
        metrics = analyze_png(Path("research/legacy-exports/screenshots/normal-male-main-window.png"))

        self.assertEqual(metrics.width, 1920)
        self.assertEqual(metrics.height, 1111)
        assert_visual_smoke(metrics)

    def test_gradient_png_passes_visual_smoke(self) -> None:
        with tempfile.TemporaryDirectory() as tmp:
            path = Path(tmp) / "gradient.png"
            write_rgb_png(path, 320, 220, gradient=True)
            metrics = analyze_png(path)

        self.assertEqual(metrics.width, 320)
        self.assertEqual(metrics.height, 220)
        self.assertGreater(metrics.luma_stddev, 8)
        self.assertGreater(metrics.unique_sampled_colors, 12)
        assert_visual_smoke(metrics)

    def test_blank_png_fails_with_useful_diagnostic(self) -> None:
        with tempfile.TemporaryDirectory() as tmp:
            path = Path(tmp) / "blank.png"
            write_rgb_png(path, 320, 220, gradient=False)
            metrics = analyze_png(path)

        with self.assertRaisesRegex(VisualRegressionError, "looks blank"):
            assert_visual_smoke(metrics)

    def test_broad_reference_comparison_reports_pass_and_fail(self) -> None:
        with tempfile.TemporaryDirectory() as tmp:
            root = Path(tmp)
            reference_path = root / "reference.png"
            candidate_path = root / "candidate.png"
            narrow_path = root / "narrow.png"
            write_rgb_png(reference_path, 320, 220, gradient=True)
            write_rgb_png(candidate_path, 330, 230, gradient=True)
            write_rgb_png(narrow_path, 900, 220, gradient=True)

            reference = analyze_png(reference_path)
            candidate = analyze_png(candidate_path)
            narrow = analyze_png(narrow_path)

        self.assertEqual(compare_visual_smoke(candidate, reference)["status"], "passed")
        failed = compare_visual_smoke(narrow, reference)
        self.assertEqual(failed["status"], "failed")
        self.assertIn("aspect", failed["message"])


def write_rgb_png(path: Path, width: int, height: int, *, gradient: bool) -> None:
    rows = []
    for y in range(height):
        row = bytearray()
        for x in range(width):
            if gradient:
                band = 48 if (x // 24 + y // 18) % 2 else 0
                row.extend((
                    min(255, (x * 255) // width + band),
                    min(255, (y * 255) // height + band),
                    min(255, ((x + y) * 255) // (width + height) + band),
                ))
            else:
                row.extend((240, 240, 240))
        rows.append(b"\x00" + bytes(row))
    raw = b"".join(rows)
    payload = bytearray(b"\x89PNG\r\n\x1a\n")
    payload.extend(png_chunk(b"IHDR", struct.pack(">IIBBBBB", width, height, 8, 2, 0, 0, 0)))
    payload.extend(png_chunk(b"IDAT", zlib.compress(raw)))
    payload.extend(png_chunk(b"IEND", b""))
    path.write_bytes(bytes(payload))


def png_chunk(chunk_type: bytes, data: bytes) -> bytes:
    crc = zlib.crc32(chunk_type)
    crc = zlib.crc32(data, crc)
    return struct.pack(">I", len(data)) + chunk_type + data + struct.pack(">I", crc & 0xFFFFFFFF)


if __name__ == "__main__":
    unittest.main()
