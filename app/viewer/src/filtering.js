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

export function baselineWindowForSignal(sampleCount, baselineStartIndex = null, baselineEndIndex = null) {
  if (sampleCount <= 0) {
    throw new Error("Signal must contain at least one sample");
  }
  const source = baselineStartIndex !== null && baselineEndIndex !== null ? "fiducials" : "signal-ends";
  const start = baselineStartIndex ?? 0;
  const end = baselineEndIndex ?? sampleCount - 1;
  if (start < 0 || start >= sampleCount || end < 0 || end >= sampleCount) {
    throw new Error("Baseline fiducials are outside the signal");
  }
  return { startIndex: start, endIndex: end, source };
}

export function buildRmsTrace(traces, name = "RMS") {
  if (!traces.length) {
    return { name, sourceRow: null, values: [] };
  }

  const sampleCount = Math.min(...traces.map((trace) => trace.values.length));
  const values = [];
  for (let sampleIndex = 0; sampleIndex < sampleCount; sampleIndex += 1) {
    const sumSquares = traces.reduce(
      (sum, trace) => sum + trace.values[sampleIndex] * trace.values[sampleIndex],
      0,
    );
    values.push(Math.sqrt(sumSquares / traces.length));
  }

  return { name, sourceRow: null, values };
}

function acCoupled(values) {
  const mean = values.reduce((sum, value) => sum + value, 0) / values.length;
  return values.map((value) => value - mean);
}

function baselineCorrected(values, baselineStartIndex, baselineEndIndex) {
  const { startIndex: start, endIndex: end } = baselineWindowForSignal(
    values.length,
    baselineStartIndex,
    baselineEndIndex,
  );
  if (start === end) {
    return values.map((value) => value - values[start]);
  }

  const slope = (values[end] - values[start]) / (end - start);
  return values.map((value, index) => value - (values[start] + slope * (index - start)));
}
