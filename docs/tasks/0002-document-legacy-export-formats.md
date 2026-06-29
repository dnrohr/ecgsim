# 0002 Document Legacy Export Formats

## Objective

Turn the legacy manual's export-format descriptions into concise implementation documentation.

## Minimal Context

The manual describes matrix, ASCII vector, geometry, source parameter, TMP waveform, ECG, and electrode export files. These formats are needed whether data comes from `.ECGsimcase` internals or legacy app exports.

## Inputs

- `research/extracted-text/www.ecgsim.org/manual/file.txt`
- `research/source/www.ecgsim.org/downloads/loadmat.m`
- `research/source/www.ecgsim.org/downloads/loadtri.m`
- `research/source/www.ecgsim.org/downloads/readECGsim.m`
- `research/source/www.ecgsim.org/downloads/other13/geometry/*`
- `research/source/www.ecgsim.org/downloads/other13/mcg/*`

## Deliverables

- Create or update `docs/file-formats/export-formats.md`.
- Document matrix, ASCII vector, `.tri`, `.tra`, `.elec`, ECG matrix, source parameter, and TMP waveform formats.
- Include units when known and explicitly mark unknowns.
- Link each format to at least one archived example file where available.

## Verification

- Documentation quotes no large copyrighted passages; summarize instead.
- All known example file extensions in the inputs are mentioned.
- Unknowns are listed as open questions rather than implied facts.

## Done When

The parser implementer can work from `docs/file-formats/export-formats.md` without searching the old manual first.
