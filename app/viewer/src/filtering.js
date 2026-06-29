export function filterSignal(values, mode, baselineStartIndex = null, baselineEndIndex = null) {
  if (mode === "dc") {
    return [...values];
  }
  if (mode === "ac") {
    return acCoupled(values);
  }
  if (mode === "baseline") {
    return baselineCorrected(values, baselineStartIndex, baselineEndIndex);
  }
  throw new Error(`Unsupported filtering mode ${mode}`);
}

export function filterTraces(traces, mode, baselineStartIndex = null, baselineEndIndex = null) {
  return traces.map((trace) => ({
    ...trace,
    values: filterSignal(trace.values, mode, baselineStartIndex, baselineEndIndex),
  }));
}

function acCoupled(values) {
  const mean = values.reduce((sum, value) => sum + value, 0) / values.length;
  return values.map((value) => value - mean);
}

function baselineCorrected(values, baselineStartIndex, baselineEndIndex) {
  const start = baselineStartIndex ?? 0;
  const end = baselineEndIndex ?? values.length - 1;
  if (start < 0 || start >= values.length || end < 0 || end >= values.length) {
    throw new Error("Baseline fiducials are outside the signal");
  }
  if (start === end) {
    return values.map((value) => value - values[start]);
  }

  const slope = (values[end] - values[start]) / (end - start);
  return values.map((value, index) => value - (values[start] + slope * (index - start)));
}
