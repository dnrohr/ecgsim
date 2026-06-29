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
    initial: generateTmpPreview(state.parameters, nodeIndex, "initial", state.sampleCount),
    adapted: generateTmpPreview(state.parameters, nodeIndex, "adapted", state.sampleCount),
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

function generateTmpPreview(parameterVectors, node, state, sampleCount) {
  const dep = parameterVectors.depolarizationMs[state][node];
  const rep = parameterVectors.repolarizationMs[state][node];
  const rest = parameterVectors.restingPotential[state][node];
  const amplitude = parameterVectors.amplitude[state][node];
  const depSlope = parameterVectors.depolarizationSlope[state][node];
  const repSlope = parameterVectors.repolarizationSlope[state][node];
  const plateauSlope = parameterVectors.plateauSlope[state][node];
  const depWidth = Math.max(depSlope * 1000, 1);
  const repWidth = Math.max(repSlope * 1000, 1);

  const values = [];
  for (let sample = 0; sample < sampleCount; sample += 1) {
    const upstroke = sigmoid((sample - dep) / depWidth);
    const recovery = sigmoid((sample - rep) / repWidth);
    const plateauDecay = Math.max(0, sample - dep) * plateauSlope / 1000;
    const value = rest + Math.max(0, amplitude - plateauDecay) * upstroke * (1 - recovery);
    values.push(Math.round(value * 1000000) / 1000000);
  }
  return values;
}

function sigmoid(value) {
  if (value < -60) {
    return 0;
  }
  if (value > 60) {
    return 1;
  }
  return 1 / (1 + Math.exp(-value));
}
