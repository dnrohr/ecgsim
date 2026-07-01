import { generateTmpSample, tmpParametersFromVectors } from "./tmp-generation.js";

export function canRecomputeLeadTraces(signalFixture, tmpState) {
  const transfer = signalFixture?.transferMatrices?.ventriclesToThorax;
  return Boolean(
    transfer
      && tmpState
      && Number.isInteger(transfer.rows)
      && Number.isInteger(transfer.columns)
      && transfer.columns === tmpState.nodeCount
      && Array.isArray(transfer.values)
      && transfer.values.length === transfer.rows,
  );
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
  return leadSystem.electrodes.map((electrode, index) => {
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
}

export function buildTmpSourceMatrix(tmpState, kind = "adapted") {
  return Array.from({ length: tmpState.nodeCount }, (_, nodeIndex) => {
    const parameters = tmpParametersFromVectors(tmpState.parameters, nodeIndex, kind);
    return Array.from({ length: tmpState.sampleCount }, (_, sampleIndex) => (
      generateTmpSample(parameters, sampleIndex, tmpState.sampleRateHz)
    ));
  });
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
