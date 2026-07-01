export function generateTmpWaveform(parameters, sampleCount, sampleRateHz = 1000) {
  const depRate = depolarizationRate(parameters.depolarizationSlope);
  const repRate = Math.max(Math.abs(parameters.repolarizationSlope), 1e-9);
  const plateauRate = Math.max(Math.abs(parameters.plateauSlope), 0);
  const repEnvelopeRate = repRate * 0.56;
  const repShape = (plateauRate / repRate) * 2.75;
  const repStartMs = parameters.depolarizationMs + 3 / depRate;
  const repStartExponent = safeExp(repEnvelopeRate * (repStartMs - parameters.repolarizationMs));
  const samplePeriodMs = 1000 / sampleRateHz;
  const activeRange = parameters.amplitude - parameters.restingPotential;

  const values = [];
  for (let sample = 0; sample < sampleCount; sample += 1) {
    const timeMs = sample * samplePeriodMs;
    const upstroke = sigmoid((timeMs - parameters.depolarizationMs) * depRate);
    const repExponent = safeExp(repEnvelopeRate * (timeMs - parameters.repolarizationMs));
    const repolarization = safeExp(-repShape * (repExponent - repStartExponent));
    const value = parameters.restingPotential + activeRange * upstroke * repolarization;
    values.push(Math.round(value * 1000000) / 1000000);
  }
  return values;
}

export function tmpParametersFromVectors(parameterVectors, node, state) {
  return {
    depolarizationMs: parameterVectors.depolarizationMs[state][node],
    repolarizationMs: parameterVectors.repolarizationMs[state][node],
    restingPotential: parameterVectors.restingPotential[state][node],
    amplitude: parameterVectors.amplitude[state][node],
    depolarizationSlope: parameterVectors.depolarizationSlope[state][node],
    plateauSlope: parameterVectors.plateauSlope[state][node],
    repolarizationSlope: parameterVectors.repolarizationSlope[state][node],
  };
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

function safeExp(value) {
  if (value < -60) {
    return Math.exp(-60);
  }
  if (value > 60) {
    return Math.exp(60);
  }
  return Math.exp(value);
}

function depolarizationRate(depolarizationSlope) {
  const slope = Math.max(Math.abs(depolarizationSlope), 1e-9);
  if (slope >= 1) {
    return slope;
  }
  return 1 / Math.max(slope * 1000, 1e-9);
}
