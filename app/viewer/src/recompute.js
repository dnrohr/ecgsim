import { generateTmpSample, tmpParametersFromVectors } from "./tmp-generation.js";

export function canRecomputeLeadTraces(signalFixture, tmpState) {
  const transfer = signalFixture?.transferMatrices?.ventriclesToThorax;
  return Boolean(
    tmpState
      && canUseThoraxTransfer(signalFixture)
      && transfer.columns === tmpState.nodeCount
  );
}

export function canUseThoraxTransfer(signalFixture) {
  const transfer = signalFixture?.transferMatrices?.ventriclesToThorax;
  return Boolean(
    transfer
      && Number.isInteger(transfer.rows)
      && Number.isInteger(transfer.columns)
      && Array.isArray(transfer.values)
      && transfer.values.length === transfer.rows
      && transfer.values.every((row) => Array.isArray(row) && row.length === transfer.columns),
  );
}

export function recomputeThoraxSurfaceSample(signalFixture, tmpState, sampleIndex, kind = "adapted") {
  const transfer = signalFixture?.transferMatrices?.ventriclesToThorax;
  if (!canRecomputeLeadTraces(signalFixture, tmpState)) {
    throw new Error("Thorax BSPM recompute requires a ventricles-to-thorax transfer matrix matching TMP nodes.");
  }
  const boundedSample = Math.max(0, Math.min(tmpState.sampleCount - 1, sampleIndex));
  const sourceValues = Array.from({ length: tmpState.nodeCount }, (_, nodeIndex) => (
    generateTmpSample(
      tmpParametersFromVectors(tmpState.parameters, nodeIndex, kind),
      boundedSample,
      tmpState.sampleRateHz,
    )
  ));
  return transfer.values.map((row) => (
    row.reduce((sum, coefficient, nodeIndex) => sum + coefficient * sourceValues[nodeIndex], 0)
  ));
}

export function sensitivityValuesForSourceNode(signalFixture, sourceNodeIndex) {
  const transfer = signalFixture?.transferMatrices?.ventriclesToThorax;
  if (!canUseThoraxTransfer(signalFixture)) {
    throw new Error("Sensitivity map requires a ventricles-to-thorax transfer matrix.");
  }
  if (sourceNodeIndex < 0 || sourceNodeIndex >= transfer.columns) {
    throw new Error(`Sensitivity source node ${sourceNodeIndex} is outside the transfer matrix.`);
  }
  return transfer.values.map((row) => row[sourceNodeIndex]);
}

export function contributionValuesForThoraxNode(signalFixture, thoraxNodeIndex) {
  const transfer = signalFixture?.transferMatrices?.ventriclesToThorax;
  if (!canUseThoraxTransfer(signalFixture)) {
    throw new Error("Contribution map requires a ventricles-to-thorax transfer matrix.");
  }
  if (thoraxNodeIndex < 0 || thoraxNodeIndex >= transfer.rows) {
    throw new Error(`Contribution thorax node ${thoraxNodeIndex} is outside the transfer matrix.`);
  }
  return transfer.values[thoraxNodeIndex];
}

export function recomputeLeadTraces(signalFixture, tmpState, leadSystem, kind = "adapted") {
  const transfer = signalFixture?.transferMatrices?.ventriclesToThorax;
  if (!canRecomputeLeadTraces(signalFixture, tmpState)) {
    throw new Error("Lead ECG recompute requires a ventricles-to-thorax transfer matrix matching TMP nodes.");
  }
  if (!leadSystem?.electrodes?.length) {
    throw new Error("Lead ECG recompute requires parsed lead-system electrode positions.");
  }

  const sourceMatrix = buildTmpSourceMatrix(tmpState, kind);
  const electrodeTraces = leadSystem.electrodes.map((electrode, index) => {
    const rowIndex = electrode.thoraxNodeIndex ?? index;
    const transferRow = transfer.values[rowIndex];
    if (!Array.isArray(transferRow) || transferRow.length !== tmpState.nodeCount) {
      throw new Error(`Lead ECG recompute electrode row ${rowIndex} is outside the transfer matrix.`);
    }
    return {
      name: electrode.label ?? `E${index + 1}`,
      sourceRow: rowIndex,
      values: multiplyTransferRow(transferRow, sourceMatrix, tmpState.sampleCount),
    };
  });
  return leadDefinitionTracesFromElectrodes(electrodeTraces, leadSystem);
}

export function leadDefinitionTracesFromElectrodes(electrodeTraces, leadSystem) {
  const leadDefinitions = leadSystem?.leadDefinitions ?? [];
  if (!leadDefinitions.length || !Array.isArray(electrodeTraces) || !electrodeTraces.length) {
    return electrodeTraces;
  }

  const leadTraces = leadDefinitions
    .map((lead, index) => {
      const electrodeTrace = electrodeTraces[lead.electrodeIndex];
      if (!electrodeTrace?.values?.length) {
        return null;
      }
      const referenceTrace = referenceTraceForLead(electrodeTraces, leadSystem, lead);
      return {
        name: lead.label ?? `Lead ${index + 1}`,
        sourceRow: electrodeTrace.sourceRow,
        referenceIndex: lead.referenceIndex ?? null,
        values: referenceTrace
          ? electrodeTrace.values.map((value, sampleIndex) => value - referenceTrace[sampleIndex])
          : [...electrodeTrace.values],
      };
    })
    .filter(Boolean);

  if (!leadSystem?.shownLeadDefinitions?.length) {
    return leadTraces;
  }

  const shownOrdered = [];
  const seen = new Set();
  leadSystem.shownLeadDefinitions.forEach((shown) => {
    const primaryIndex = shown.primaryLeadIndex;
    if (!Number.isInteger(primaryIndex) || seen.has(primaryIndex) || !leadTraces[primaryIndex]) {
      return;
    }
    seen.add(primaryIndex);
    shownOrdered.push({
      ...leadTraces[primaryIndex],
      name: shown.label ?? leadTraces[primaryIndex].name,
      displayGroup: shown.displayGroup ?? null,
      gridPosition: shown.gridPosition ?? null,
    });
  });
  leadTraces.forEach((trace, index) => {
    if (!seen.has(index)) {
      shownOrdered.push(trace);
    }
  });
  return shownOrdered;
}

export function buildTmpSourceMatrix(tmpState, kind = "adapted") {
  return Array.from({ length: tmpState.nodeCount }, (_, nodeIndex) => {
    const parameters = tmpParametersFromVectors(tmpState.parameters, nodeIndex, kind);
    return Array.from({ length: tmpState.sampleCount }, (_, sampleIndex) => (
      generateTmpSample(parameters, sampleIndex, tmpState.sampleRateHz)
    ));
  });
}

function referenceTraceForLead(electrodeTraces, leadSystem, lead) {
  const reference = leadSystem?.referenceDefinitions?.[lead.referenceIndex];
  const indices = reference?.electrodeIndices ?? [];
  const memberTraces = indices
    .map((index) => electrodeTraces[index]?.values)
    .filter((values) => Array.isArray(values) && values.length);
  if (!memberTraces.length) {
    return null;
  }
  const sampleCount = memberTraces[0].length;
  return Array.from({ length: sampleCount }, (_, sampleIndex) => (
    memberTraces.reduce((sum, values) => sum + values[sampleIndex], 0) / memberTraces.length
  ));
}

function multiplyTransferRow(transferRow, sourceMatrix, sampleCount) {
  const output = Array(sampleCount).fill(0);
  for (let nodeIndex = 0; nodeIndex < transferRow.length; nodeIndex += 1) {
    const coefficient = transferRow[nodeIndex];
    const source = sourceMatrix[nodeIndex];
    if (!Number.isFinite(coefficient) || !source) {
      continue;
    }
    for (let sampleIndex = 0; sampleIndex < sampleCount; sampleIndex += 1) {
      output[sampleIndex] += coefficient * source[sampleIndex];
    }
  }
  return output;
}
