export function sequentialRgb(value, min, span) {
  const ratio = clamp01((value - min) / Math.max(span, 1e-9));
  if (ratio < 0.5) {
    const local = ratio * 2;
    return interpolateRgb([0.08, 0.28, 0.62], [0.95, 0.92, 0.48], local);
  }
  return interpolateRgb([0.95, 0.92, 0.48], [0.72, 0.12, 0.1], (ratio - 0.5) * 2);
}

export function divergingRgb(value, maxAbs) {
  const scale = Math.max(Math.abs(maxAbs), 1e-9);
  const ratio = clamp01((value / scale + 1) / 2);
  if (ratio < 0.5) {
    return interpolateRgb([0.05, 0.25, 0.62], [0.94, 0.94, 0.9], ratio * 2);
  }
  return interpolateRgb([0.94, 0.94, 0.9], [0.68, 0.08, 0.08], (ratio - 0.5) * 2);
}

export function contourLevels(min, max, count = 9) {
  if (!Number.isFinite(min) || !Number.isFinite(max) || max <= min || count < 2) {
    return [];
  }
  const step = (max - min) / (count + 1);
  return Array.from({ length: count }, (_, index) => min + step * (index + 1));
}

export function contourNodeIndexes(values, levels, tolerance) {
  if (!Array.isArray(values) || !Array.isArray(levels) || !levels.length || tolerance <= 0) {
    return [];
  }
  const indexes = [];
  values.forEach((value, index) => {
    if (Number.isFinite(value) && levels.some((level) => Math.abs(value - level) <= tolerance)) {
      indexes.push(index);
    }
  });
  return indexes;
}

function interpolateRgb(start, end, ratio) {
  const clamped = clamp01(ratio);
  return start.map((value, index) => value + (end[index] - value) * clamped);
}

function clamp01(value) {
  return Math.max(0, Math.min(1, value));
}
