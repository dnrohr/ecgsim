# ECGsimsource Source Info

Status: task `0075` source-interchange notes.

## Legacy Evidence

The ECGSIM manual says `Save Source Info` writes source data, meaning source parameter values for all sources in a case, to a separate file with extension `.ECGsimsource`. `Open Source Info` later loads those stored parameters and replaces the source parameters in a compatible case.

No archived fixture or byte-level writer specification has been found yet. The manual does not document headers, encoding, object signatures, source ordering, initial/adapted handling, or compatibility checks.

## Modern Source Info JSON

Until a real `.ECGsimsource` fixture is captured, this project supports a modern, explicit interchange file:

```text
<case>.ECGsimsource.json
```

Schema:

```text
org.ecgsim.source-info
```

The payload preserves:

- case file name, SHA-256, and byte size,
- source id, source kind, and source offset,
- beat id,
- every parsed source parameter,
- units,
- initial and adapted vectors.

It is intentionally not byte-compatible with legacy `.ECGsimsource`. It is a safe source-parameter interchange path and a future bridge for implementing the true legacy format once captured evidence exists.

## CLI

Export source info from a supported case:

```powershell
python -m ecgsim.cli.source_info research/source/www.ecgsim.org/downloads/cases/normal_male2.ECGsimcase scratch/normal_male2.ECGsimsource.json
```

Installed environments also expose:

```powershell
ecgsim-source-info <case-file> <output-file>
```

## Validation

`ecgsim.io.validate_source_info()` checks:

- schema and version,
- case identity,
- at least one source and beat,
- parameter initial/adapted vector shape,
- consistent node counts within each source,
- numeric vector values.

Callers can pass an expected case SHA-256 to reject source info from another case.

## Legacy Capture Requirement

Before writing true `.ECGsimsource`, capture at least one file from the Windows app with a small, known source edit and document:

- whether the file is text or binary,
- source and beat ordering,
- whether initial values are present or adapted values only,
- parameter order and units,
- compatibility fields used by `Open Source Info`,
- behavior when loaded into a different case.
