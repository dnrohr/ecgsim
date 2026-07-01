# Fiducial And Filtering Notes

Status: task `0052` partial implementation and blocker notes.

## Supported In Current Code

- DC coupling passes values through unchanged.
- AC coupling subtracts each trace's time mean.
- Baseline coupling subtracts the line between two baseline samples.
- The filtering core now reports whether the baseline window came from parsed fiducials or from the signal-end fallback.
- Case signal metadata and viewer fixtures explicitly mark P-wave/T-wave fiducials as unavailable for the bundled cases.
- The Leads pane status reports the active coupling mode and whether baseline is using fallback endpoints.

## Legacy Requirement

The Leads manual says baseline correction should set values at the beginning of the P wave and termination of the T wave to zero. Those samples have not been located in the parsed `.ECGsimcase` payloads.

## Current Blocker

Task `0048` now provides promoted normal male ECGSIM 3.0.1 `.refECG` and `.adaptECG` fixtures, so filtering can start comparing against real legacy output. Until P/T fiducials are parsed or inferred from those exports, baseline mode remains a documented fallback rather than a parity claim.
