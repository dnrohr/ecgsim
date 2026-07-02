import { generateTmpSample, tmpParametersFromVectors } from "./tmp-generation.js";

export function ariValues(parameterVectors, state = "adapted") {
  const depolarization = parameterVectors?.depolarizationMs?.[state] ?? [];
  const repolarization = parameterVectors?.repolarizationMs?.[state] ?? [];
  const count = Math.min(depolarization.length, repolarization.length);
  return Array.from({ length: count }, (_, index) => repolarization[index] - depolarization[index]);
}

export function tmpAtTimeValues(tmpState, state = "adapted", sample = 0) {
  if (!tmpState?.parameters) {
    return [];
  }
  const sampleIndex = Math.max(0, Math.min(tmpState.sampleCount - 1, Math.round(sample)));
  return Array.from({ length: tmpState.nodeCount }, (_, node) => (
    generateTmpSample(
      tmpParametersFromVectors(tmpState.parameters, node, state),
      sampleIndex,
      tmpState.sampleRateHz,
    )
  ));
}

export function heartSurfaceValues(tmpState, surface, state = "adapted", sample = 0) {
  if (!tmpState?.parameters) {
    return [];
  }
  if (surface === "ariMs") {
    return ariValues(tmpState.parameters, state);
  }
  if (surface === "tmpAtTime") {
    return tmpAtTimeValues(tmpState, state, sample);
  }
  return tmpState.parameters?.[surface]?.[state] ?? [];
}

export function finiteRange(values) {
  const finite = values.filter(Number.isFinite);
  if (!finite.length) {
    return { min: 0, max: 0, span: 1, finiteCount: 0 };
  }
  const min = Math.min(...finite);
  const max = Math.max(...finite);
  return { min, max, span: Math.max(max - min, 1e-9), finiteCount: finite.length };
}
