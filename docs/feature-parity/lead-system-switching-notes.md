# Lead System Switching Notes

Status: task `0043` first functional lead-system switching slice.

## Supported In Current Viewer

- Lead-system selector switches among parsed systems for the loaded case.
- Coupling, scale, grid, RMS, and shared time cursor state are preserved across switches.
- Leads plot redraws electrode surface-potential traces from the measured thorax map using each system's nearest thorax nodes.
- Thorax electrode markers update to the selected lead system.
- Supported case switching updates available lead-system names and electrode counts.

## Current Limitations

- Clinical lead transforms are not yet parity-complete because lead polarity/reference and shown-lead layout semantics remain unsupported parser fields.
- Standard 12-lead and Frank VCG selections currently display electrode potentials, not transformed lead signals.
- Exact electrode patch geometry is not implemented; markers use small spheres at parsed electrode coordinates.
- Initial/adapted simulated lead systems require recomputation and signal classification.
