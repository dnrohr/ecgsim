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
    undoStack: [],
    redoStack: [],
    nextTransactionId: 1,
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

export function applyWeightedParameterTransaction(state, parameter, nodeWeights, nextValue, selection = {}) {
  const nodeIndexes = uniqueNodeIndexes(nodeWeights.map((node) => node.index), state.nodeCount);
  if (!nodeIndexes.length || !Number.isFinite(nextValue)) {
    return null;
  }
  return commitMutationTransaction(state, {
    kind: "applyParameter",
    parameter,
    selection: {
      ...selection,
      nodeWeights: nodeWeights.map((node) => ({
        index: node.index,
        weight: node.weight,
      })),
    },
    nodeIndexes,
    mutate: () => applyWeightedParameterValue(state, parameter, nodeWeights, nextValue),
  });
}

export function resetWeightedParameterTransaction(state, parameter, nodeWeights, selection = {}) {
  const nodeIndexes = uniqueNodeIndexes(nodeWeights.map((node) => node.index), state.nodeCount);
  if (!nodeIndexes.length) {
    return null;
  }
  return commitMutationTransaction(state, {
    kind: "resetParameter",
    parameter,
    selection: {
      ...selection,
      nodeWeights: nodeWeights.map((node) => ({
        index: node.index,
        weight: node.weight,
      })),
    },
    nodeIndexes,
    mutate: () => resetWeightedParameter(state, parameter, nodeWeights),
  });
}

export function resetBeatTransaction(state) {
  const nodeIndexes = Array.from({ length: state.nodeCount }, (_, index) => index);
  return commitMutationTransaction(state, {
    kind: "resetBeat",
    parameter: null,
    selection: { mode: "allNodes" },
    nodeIndexes,
    mutate: () => resetBeat(state),
  });
}

export function undoLastTransaction(state) {
  const transaction = state.undoStack.pop();
  if (!transaction) {
    return null;
  }
  applyTransactionValues(state, transaction, "previousAdapted");
  state.redoStack.push(transaction);
  return transaction;
}

export function redoLastTransaction(state) {
  const transaction = state.redoStack.pop();
  if (!transaction) {
    return null;
  }
  applyTransactionValues(state, transaction, "nextAdapted");
  state.undoStack.push(transaction);
  return transaction;
}

export function serializeTmpEditState(state, caseMetadata = {}) {
  return {
    schema: "org.ecgsim.source-edits",
    version: 1,
    case: {
      fileName: caseMetadata.fileName ?? null,
      sha256: caseMetadata.sha256 ?? null,
    },
    sourceKind: "ventricles",
    beatId: "beat1",
    nodeCount: state.nodeCount,
    sampleCount: state.sampleCount,
    sampleRateHz: state.sampleRateHz,
    adaptedValues: Object.fromEntries(
      Object.entries(state.parameters).map(([parameter, vectors]) => [
        parameter,
        [...vectors.adapted],
      ]),
    ),
    undoStack: cloneTransactions(state.undoStack),
    redoStack: cloneTransactions(state.redoStack),
    nextTransactionId: state.nextTransactionId,
  };
}

export function applyTmpEditSnapshot(state, snapshot, caseMetadata = {}) {
  validateTmpEditSnapshot(state, snapshot, caseMetadata);
  Object.entries(snapshot.adaptedValues).forEach(([parameter, values]) => {
    if (state.parameters[parameter]) {
      state.parameters[parameter].adapted = [...values];
    }
  });
  state.undoStack = cloneTransactions(snapshot.undoStack ?? []);
  state.redoStack = cloneTransactions(snapshot.redoStack ?? []);
  state.nextTransactionId = Number.isInteger(snapshot.nextTransactionId)
    ? snapshot.nextTransactionId
    : nextTransactionIdFromStacks(state.undoStack, state.redoStack);
  return state;
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

function commitMutationTransaction(state, { kind, parameter, selection, nodeIndexes, mutate }) {
  const before = snapshotAdaptedValues(state, nodeIndexes);
  mutate();
  const changes = changedAdaptedValues(state, nodeIndexes, before);
  if (!changes.length) {
    return null;
  }
  const transaction = {
    id: state.nextTransactionId,
    kind,
    sourceKind: "ventricles",
    beatId: "beat1",
    parameter,
    selection,
    changes,
  };
  state.nextTransactionId += 1;
  state.undoStack.push(transaction);
  state.redoStack = [];
  return transaction;
}

function snapshotAdaptedValues(state, nodeIndexes) {
  const snapshots = new Map();
  for (const nodeIndex of nodeIndexes) {
    const nodeSnapshot = {};
    Object.entries(state.parameters).forEach(([parameter, vectors]) => {
      nodeSnapshot[parameter] = vectors.adapted[nodeIndex];
    });
    snapshots.set(nodeIndex, nodeSnapshot);
  }
  return snapshots;
}

function changedAdaptedValues(state, nodeIndexes, before) {
  const changes = [];
  for (const nodeIndex of nodeIndexes) {
    Object.entries(state.parameters).forEach(([parameter, vectors]) => {
      const previousAdapted = before.get(nodeIndex)?.[parameter];
      const nextAdapted = vectors.adapted[nodeIndex];
      if (previousAdapted !== nextAdapted) {
        changes.push({
          nodeIndex,
          parameter,
          previousAdapted,
          nextAdapted,
        });
      }
    });
  }
  return changes;
}

function applyTransactionValues(state, transaction, valueKey) {
  transaction.changes.forEach((change) => {
    const vector = state.parameters[change.parameter]?.adapted;
    if (vector && change.nodeIndex >= 0 && change.nodeIndex < vector.length) {
      vector[change.nodeIndex] = change[valueKey];
    }
  });
}

function uniqueNodeIndexes(nodeIndexes, nodeCount) {
  return [...new Set(nodeIndexes)]
    .filter((index) => Number.isInteger(index) && index >= 0 && index < nodeCount);
}

function validateTmpEditSnapshot(state, snapshot, caseMetadata) {
  if (!snapshot || snapshot.schema !== "org.ecgsim.source-edits" || snapshot.version !== 1) {
    throw new Error("Unsupported source-edit snapshot format.");
  }
  if (snapshot.case?.sha256 && caseMetadata.sha256 && snapshot.case.sha256 !== caseMetadata.sha256) {
    throw new Error("Source-edit snapshot belongs to a different case.");
  }
  if (snapshot.nodeCount !== state.nodeCount) {
    throw new Error("Source-edit snapshot node count does not match this case.");
  }
  Object.entries(state.parameters).forEach(([parameter, vectors]) => {
    const values = snapshot.adaptedValues?.[parameter];
    if (!Array.isArray(values) || values.length !== vectors.adapted.length) {
      throw new Error(`Source-edit snapshot is missing adapted values for ${parameter}.`);
    }
  });
}

function cloneTransactions(transactions) {
  return transactions.map((transaction) => ({
    ...transaction,
    selection: transaction.selection ? { ...transaction.selection } : transaction.selection,
    changes: transaction.changes.map((change) => ({ ...change })),
  }));
}

function nextTransactionIdFromStacks(...stacks) {
  const maxId = stacks
    .flat()
    .reduce((highest, transaction) => Math.max(highest, transaction.id ?? 0), 0);
  return maxId + 1;
}
