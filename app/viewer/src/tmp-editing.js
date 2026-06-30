import { generateTmpWaveform, tmpParametersFromVectors } from "./tmp-generation.js";

export const EDITABLE_PARAMETERS = [
  { id: "depolarizationMs", label: "Depolarization", unit: "ms", step: 1 },
  { id: "repolarizationMs", label: "Repolarization", unit: "ms", step: 1 },
  { id: "restingPotential", label: "Resting", unit: "mV", step: 0.05 },
  { id: "amplitude", label: "Amplitude", unit: "mV", step: 0.05 },
  { id: "plateauSlope", label: "Plateau slope", unit: "", step: 0.01 },
  { id: "repolarizationSlope", label: "Repol. slope", unit: "", step: 0.01 },
];

export function createTmpEditState(fixture) {
  return {
    sampleRateHz: fixture.sampleRateHz,
    sampleCount: fixture.sampleCount,
    nodeCount: fixture.nodeCount,
    parameters: Object.fromEntries(
      Object.entries(fixture.parameterVectors).map(([name, vectors]) => [
        name,
        {
          initial: [...vectors.initial],
          adapted: [...vectors.adapted],
        },
      ]),
    ),
    defaultNodes: fixture.nodes.map((node) => node.sourceNode),
    selectedNode: null,
  };
}

export function applyParameterValue(state, parameter, nodeIndexes, nextValue) {
  const vector = state.parameters[parameter]?.adapted;
  if (!vector || !Number.isFinite(nextValue)) {
    return 0;
  }

  let changed = 0;
  for (const nodeIndex of nodeIndexes) {
    if (nodeIndex >= 0 && nodeIndex < vector.length && vector[nodeIndex] !== nextValue) {
      vector[nodeIndex] = nextValue;
      changed += 1;
    }
  }
  enforceSlopeConstraint(state, nodeIndexes);
  return changed;
}

export function applyWeightedParameterValue(state, parameter, nodeWeights, nextValue) {
  const vector = state.parameters[parameter]?.adapted;
  if (!vector || !Number.isFinite(nextValue)) {
    return 0;
  }

  let changed = 0;
  const changedIndexes = [];
  for (const node of nodeWeights) {
    if (node.index >= 0 && node.index < vector.length && node.weight > 0) {
      const weight = Math.max(0, Math.min(1, node.weight));
      const blended = vector[node.index] + (nextValue - vector[node.index]) * weight;
      if (vector[node.index] !== blended) {
        vector[node.index] = blended;
        changed += 1;
        changedIndexes.push(node.index);
      }
    }
  }
  enforceSlopeConstraint(state, changedIndexes);
  return changed;
}

export function resetParameter(state, parameter, nodeIndexes) {
  const vectors = state.parameters[parameter];
  if (!vectors) {
    return 0;
  }

  let changed = 0;
  for (const nodeIndex of nodeIndexes) {
    if (nodeIndex >= 0 && nodeIndex < vectors.adapted.length) {
      vectors.adapted[nodeIndex] = vectors.initial[nodeIndex];
      changed += 1;
    }
  }
  enforceSlopeConstraint(state, nodeIndexes);
  return changed;
}

export function resetWeightedParameter(state, parameter, nodeWeights) {
  const vectors = state.parameters[parameter];
  if (!vectors) {
    return 0;
  }

  let changed = 0;
  const changedIndexes = [];
  for (const node of nodeWeights) {
    if (node.index >= 0 && node.index < vectors.adapted.length && node.weight > 0) {
      const weight = Math.max(0, Math.min(1, node.weight));
      vectors.adapted[node.index] += (vectors.initial[node.index] - vectors.adapted[node.index]) * weight;
      changed += 1;
      changedIndexes.push(node.index);
    }
  }
  enforceSlopeConstraint(state, changedIndexes);
  return changed;
}

export function resetBeat(state) {
  Object.values(state.parameters).forEach((vectors) => {
    vectors.adapted = [...vectors.initial];
  });
}

export function nodeParameterValue(state, parameter, nodeIndex, kind = "adapted") {
  return state.parameters[parameter]?.[kind]?.[nodeIndex] ?? null;
}

export function buildTmpPlotNodes(state) {
  const sourceNodes = state.selectedNode === null
    ? state.defaultNodes
    : [state.selectedNode, ...state.defaultNodes.filter((node) => node !== state.selectedNode)].slice(0, 5);

  return sourceNodes.map((nodeIndex) => ({
    name: `Heart node ${nodeIndex + 1}`,
    sourceNode: nodeIndex,
    parameters: Object.fromEntries(
      Object.entries(state.parameters).map(([name, vectors]) => [
        name,
        {
          initial: vectors.initial[nodeIndex],
          adapted: vectors.adapted[nodeIndex],
        },
      ]),
    ),
    initial: generateTmpWaveform(
      tmpParametersFromVectors(state.parameters, nodeIndex, "initial"),
      state.sampleCount,
      state.sampleRateHz,
    ),
    adapted: generateTmpWaveform(
      tmpParametersFromVectors(state.parameters, nodeIndex, "adapted"),
      state.sampleCount,
      state.sampleRateHz,
    ),
  }));
}

function enforceSlopeConstraint(state, nodeIndexes) {
  const plateau = state.parameters.plateauSlope?.adapted;
  const repolarization = state.parameters.repolarizationSlope?.adapted;
  if (!plateau || !repolarization) {
    return;
  }
  for (const nodeIndex of nodeIndexes) {
    if (nodeIndex >= 0 && nodeIndex < plateau.length && plateau[nodeIndex] > repolarization[nodeIndex]) {
      repolarization[nodeIndex] = plateau[nodeIndex];
    }
  }
}
