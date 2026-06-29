export function generateTmpWaveform(parameters, sampleCount, sampleRateHz = 1000) {
  const depWidthMs = Math.max(parameters.depolarizationSlope * 1000, 1);
  const repWidthMs = Math.max(parameters.repolarizationSlope * 1000, 1);
  const samplePeriodMs = 1000 / sampleRateHz;

  const values = [];
  for (let sample = 0; sample < sampleCount; sample += 1) {
    const timeMs = sample * samplePeriodMs;
    const upstroke = sigmoid((timeMs - parameters.depolarizationMs) / depWidthMs);
    const recovery = sigmoid((timeMs - parameters.repolarizationMs) / repWidthMs);
    const plateauDecay = Math.max(0, timeMs - parameters.depolarizationMs) * parameters.plateauSlope / 1000;
    const activeAmplitude = Math.max(0, parameters.amplitude - plateauDecay);
    const value = parameters.restingPotential + activeAmplitude * upstroke * (1 - recovery);
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
