const DEFAULT_PREVIEW_SPACING_MM = 1;

export function createFocusEditState(metadata, nodeCount) {
  const activation = supportedActivationConstruction(metadata);
  const ventricularActivation = ventricularActivationConstruction(metadata);
  const sample = activation?.sampleEntries?.[0] ?? {};
  const initialFocusTimeMs = finiteOrDefault(sample.floatField1, 0);
  const initialVelocityMmPerMs = finiteOrDefault(sample.floatField2, 0.8);
  return {
    isSupported: Boolean(activation && nodeCount > 0),
    unavailableReason: activation
      ? "Legacy focus field mutation, opposite-wall mapping, and graph-geometry velocity parity remain unavailable."
      : ventricularActivation
        ? "Focus preview is enabled only for supported WPW cases; this case keeps activation records read-only."
        : "No ventricular activation construction records are available for this case.",
    source: activation,
    nodeCount,
    focusNode: 0,
    focusTimeMs: initialFocusTimeMs,
    velocityMmPerMs: initialVelocityMmPerMs > 0 ? initialVelocityMmPerMs : 0.8,
    preview: null,
  };
}

export function supportedActivationConstruction(metadata) {
  const fileName = String(metadata?.fileName ?? "");
  if (!fileName.startsWith("WPW_")) {
    return null;
  }
  return ventricularActivationConstruction(metadata);
}

function ventricularActivationConstruction(metadata) {
  const activations = Array.isArray(metadata?.activationConstructions)
    ? metadata.activationConstructions
    : [];
  return activations.find(
    (activation) => activation?.sourceKind === "ventricles" && activation.entryCount > 0,
  ) ?? null;
}

export function applyFocusSelection(state, selectedNode) {
  if (!state?.isSupported || !Number.isInteger(selectedNode)) {
    return false;
  }
  if (selectedNode < 0 || selectedNode >= state.nodeCount) {
    return false;
  }
  state.focusNode = selectedNode;
  return true;
}

export function updateFocusParameters(state, { focusNode, focusTimeMs, velocityMmPerMs }) {
  if (!state?.isSupported) {
    return false;
  }
  const nextNode = Number.parseInt(focusNode, 10) - 1;
  const nextTime = Number.parseFloat(focusTimeMs);
  const nextVelocity = Number.parseFloat(velocityMmPerMs);
  if (
    !Number.isInteger(nextNode) ||
    nextNode < 0 ||
    nextNode >= state.nodeCount ||
    !Number.isFinite(nextTime) ||
    !Number.isFinite(nextVelocity) ||
    nextVelocity <= 0
  ) {
    return false;
  }
  state.focusNode = nextNode;
  state.focusTimeMs = nextTime;
  state.velocityMmPerMs = nextVelocity;
  return true;
}

export function previewFocusActivation(state) {
  if (!state?.isSupported) {
    return null;
  }
  const edges = linearPreviewEdges(state.nodeCount, state.velocityMmPerMs);
  const times = fastestRouteActivationTimes(
    state.nodeCount,
    edges,
    [{ node: state.focusNode, time: state.focusTimeMs }],
  );
  const finiteTimes = times.filter(Number.isFinite);
  const preview = {
    node: state.focusNode,
    focusTimeMs: state.focusTimeMs,
    velocityMmPerMs: state.velocityMmPerMs,
    reachableCount: finiteTimes.length,
    minMs: finiteTimes.length ? Math.min(...finiteTimes) : null,
    maxMs: finiteTimes.length ? Math.max(...finiteTimes) : null,
    graph: "linear-index-preview",
  };
  state.preview = preview;
  return preview;
}

export function linearPreviewEdges(nodeCount, velocityMmPerMs, spacingMm = DEFAULT_PREVIEW_SPACING_MM) {
  if (!Number.isInteger(nodeCount) || nodeCount < 0) {
    throw new Error("nodeCount must be a non-negative integer");
  }
  if (!Number.isFinite(velocityMmPerMs) || velocityMmPerMs <= 0) {
    throw new Error("velocity must be positive");
  }
  const edges = [];
  for (let node = 0; node < nodeCount - 1; node += 1) {
    edges.push({ nodeA: node, nodeB: node + 1, length: spacingMm, velocity: velocityMmPerMs });
  }
  return edges;
}

export function fastestRouteActivationTimes(nodeCount, edges, foci) {
  if (!Number.isInteger(nodeCount) || nodeCount < 0) {
    throw new Error("nodeCount must be a non-negative integer");
  }
  const graph = Array.from({ length: nodeCount }, () => []);
  edges.forEach((edge) => {
    validateNode(edge.nodeA, nodeCount);
    validateNode(edge.nodeB, nodeCount);
    if (!Number.isFinite(edge.length) || edge.length < 0) {
      throw new Error("edge length must be non-negative");
    }
    if (!Number.isFinite(edge.velocity) || edge.velocity <= 0) {
      throw new Error("edge velocity must be positive");
    }
    const travelTime = edge.length / edge.velocity;
    graph[edge.nodeA].push([edge.nodeB, travelTime]);
    graph[edge.nodeB].push([edge.nodeA, travelTime]);
  });

  const times = Array(nodeCount).fill(Infinity);
  const queue = [];
  foci.forEach((focus) => {
    validateNode(focus.node, nodeCount);
    if (!Number.isFinite(focus.time)) {
      throw new Error("focus time must be finite");
    }
    if (focus.time < times[focus.node]) {
      times[focus.node] = focus.time;
      pushQueue(queue, [focus.time, focus.node]);
    }
  });

  while (queue.length) {
    const [currentTime, node] = popQueue(queue);
    if (currentTime > times[node]) {
      continue;
    }
    graph[node].forEach(([neighbor, travelTime]) => {
      const nextTime = currentTime + travelTime;
      if (nextTime < times[neighbor]) {
        times[neighbor] = nextTime;
        pushQueue(queue, [nextTime, neighbor]);
      }
    });
  }
  return times;
}

function finiteOrDefault(value, fallback) {
  return Number.isFinite(value) ? value : fallback;
}

function validateNode(node, nodeCount) {
  if (!Number.isInteger(node) || node < 0 || node >= nodeCount) {
    throw new Error(`node index ${node} outside 0..${nodeCount - 1}`);
  }
}

function pushQueue(queue, item) {
  queue.push(item);
  queue.sort((left, right) => left[0] - right[0]);
}

function popQueue(queue) {
  return queue.shift();
}
