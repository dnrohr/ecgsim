export const ECG_SIGNAL_SCHEMA = "org.ecgsim.ecg-signals";
export const ECG_SIGNAL_VERSION = 1;

export function validateImportedEcgSignals(payload) {
  if (!payload || typeof payload !== "object" || Array.isArray(payload)) {
    throw new Error("ECG import must be a JSON object");
  }
  if (payload.schema !== ECG_SIGNAL_SCHEMA) {
    throw new Error(`ECG import schema must be ${ECG_SIGNAL_SCHEMA}`);
  }
  if (payload.version !== ECG_SIGNAL_VERSION) {
    throw new Error(`ECG import version must be ${ECG_SIGNAL_VERSION}`);
  }
  const name = requiredString(payload, "name");
  const units = requiredString(payload, "units");
  const sampleRateHz = requiredPositiveNumber(payload, "sampleRateHz");
  const leadLabels = requiredStringArray(payload, "leadLabels");
  const valuesByLead = requiredNumericMatrix(payload, "valuesByLead");

  if (leadLabels.length !== valuesByLead.length) {
    throw new Error("leadLabels length must match valuesByLead rows");
  }

  return {
    source: "imported",
    signalKind: `Imported ECG (${units})`,
    name,
    units,
    sampleRateHz,
    rows: valuesByLead.length,
    columns: valuesByLead[0].length,
    traces: valuesByLead.map((values, index) => ({
      name: leadLabels[index],
      sourceRow: index,
      values,
    })),
    fiducials: { status: "external" },
  };
}

export async function readImportedEcgFile(file) {
  try {
    return validateImportedEcgSignals(JSON.parse(await file.text()));
  } catch (error) {
    if (error instanceof SyntaxError) {
      throw new Error(`ECG import JSON could not be parsed: ${error.message}`);
    }
    throw error;
  }
}

function requiredString(payload, key) {
  const value = payload[key];
  if (typeof value !== "string" || !value.trim()) {
    throw new Error(`${key} must be a non-empty string`);
  }
  return value.trim();
}

function requiredPositiveNumber(payload, key) {
  const value = payload[key];
  if (typeof value !== "number" || !Number.isFinite(value) || value <= 0) {
    throw new Error(`${key} must be a positive number`);
  }
  return value;
}

function requiredStringArray(payload, key) {
  const value = payload[key];
  if (!Array.isArray(value) || !value.length) {
    throw new Error(`${key} must be a non-empty array`);
  }
  return value.map((item, index) => {
    if (typeof item !== "string" || !item.trim()) {
      throw new Error(`${key}[${index}] must be a non-empty string`);
    }
    return item.trim();
  });
}

function requiredNumericMatrix(payload, key) {
  const value = payload[key];
  if (!Array.isArray(value) || !value.length) {
    throw new Error(`${key} must be a non-empty matrix`);
  }
  let expectedColumns = null;
  return value.map((row, rowIndex) => {
    if (!Array.isArray(row) || !row.length) {
      throw new Error(`${key}[${rowIndex}] must be a non-empty numeric row`);
    }
    const numericRow = row.map((item, columnIndex) => {
      if (typeof item !== "number" || !Number.isFinite(item)) {
        throw new Error(`${key}[${rowIndex}][${columnIndex}] must be numeric`);
      }
      return item;
    });
    if (expectedColumns === null) {
      expectedColumns = numericRow.length;
    } else if (numericRow.length !== expectedColumns) {
      throw new Error(`${key} rows must all have the same length`);
    }
    return numericRow;
  });
}
