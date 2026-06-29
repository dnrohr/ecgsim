# ECGsimcase Format Notes

Task: `docs/tasks/0001-inspect-ecgsimcase-structure.md`

Status: exploratory. This document identifies the container structure well enough to plan a metadata reader; it is not a complete parser spec yet.

## Inspected Files

All downloaded `.ECGsimcase` files were inspected:

| File | Bytes | SHA-256 |
| --- | ---: | --- |
| `normal_male2.ECGsimcase` | 11,323,178 | `4da15b759b8bc4880843bc647a257f66e36b64042583d0ad1c3e11bdc6169c4a` |
| `WPW_Bundleonly.ECGsimcase` | 16,809,796 | `2ec84bb53ea60e564ce6ff495e88ac6343047cea8a76db9dd69973b18e38f5c4` |
| `WPW_ectopicbeat.ECGsimcase` | 17,451,796 | `869412d681c9860837117ce7a98a62cf381ce92b64ae5b68aecfc3b735f22749` |
| `WPW_fusionbeat.ECGsimcase` | 16,875,796 | `09dc777f2b8eca47e893c5a6ae2e1ae9daf34f64436eebf03ceb7ec0eda1f970` |

## Repeatable Inspection

Run:

```powershell
python tools/inspect_ecgsimcase.py "research/source/www.ecgsim.org/downloads/cases/*.ECGsimcase" --max-strings 20
```

The tool reports file size, checksum, entropy, header bytes, length-prefixed UTF-16LE strings, and counts of class-like `P...` markers.

The downloaded cases are not recognized by `tar` or PowerShell `Expand-Archive`, and they do not start with common archive/database signatures such as ZIP, gzip, 7z, RAR, or SQLite.

## Encoding And Container Type

The files appear to be custom little-endian binary serialization streams. Strings use a repeated pattern:

```text
uint32_le byte_length
utf16le text bytes
```

The first bytes of every inspected case are:

```text
16 00 00 00 50 00 45 00 43 00 47 00 73 00 69 00
6D 00 44 00 61 00 74 00 61 00
```

Interpreted as the string format above, this is:

```text
length: 22 bytes
text: PECGsimData
```

The next string marker is `PECG`, followed by integer fields and a `PMatrix` marker. This strongly suggests a custom object graph rather than a file archive with named members.

No compression has been identified. Entropy is around 5.8 to 5.9 bits/byte, and numeric regions contain readable little-endian float values.

## Common Object Markers

All four case files share the same class-marker vocabulary. Counts are identical except for lead display markers in the normal case:

| Marker | normal male count | WPW counts | Likely purpose |
| --- | ---: | ---: | --- |
| `PECGsimData` | 1 | 1 | File/root object signature. |
| `PECG` | 1 | 1 | ECG signal or case-level ECG block. |
| `PMatrix` | 31 | 31 | Matrix payloads: ECG/signal data, transfer functions, adjacency/distance data, or lead transforms. |
| `PVolumeConductor` | 1 | 1 | Volume conductor/model container. |
| `PGeometry` | 8 | 8 | Geometry objects. |
| `PGraphGeometry` | 2 | 2 | Graph/adjacency-related geometry objects. |
| `PSource` | 2 | 2 | Atrial and ventricular source containers, or initial/adapted source groups. Needs confirmation. |
| `PSourceParameter` | 14 | 14 | Source parameter groups. |
| `PVector` | 30 | 30 | Vector payloads within source parameters and activation construction. |
| `PActivationConstruction` | 2 | 2 | Activation construction data, probably one per source. |
| `PLeadSystem` | 4 | 4 | Lead-system containers. |
| `PLead` | 98 | 99 | Lead definitions. |
| `PLeadReference` | 9 | 9 | Lead reference definitions, such as zeromean or extremities. |
| `PShowLead` | 91 | 92 | Displayed lead definitions. |

The normal case has one fewer `PLead` and `PShowLead` than the WPW cases.

## Major Block Offsets

| File | `PVolumeConductor` | `PSource` blocks | `PLeadSystem` blocks |
| --- | ---: | --- | --- |
| `normal_male2.ECGsimcase` | 1,203,688 | 11,271,432; 11,272,238 | 11,312,216; 11,313,772; 11,314,874; 11,321,770 |
| `WPW_Bundleonly.ECGsimcase` | 1,640,088 | 16,749,740; 16,750,546 | 16,798,752; 16,800,308; 16,801,410; 16,808,388 |
| `WPW_ectopicbeat.ECGsimcase` | 2,282,088 | 17,391,740; 17,392,546 | 17,440,752; 17,442,308; 17,443,410; 17,450,388 |
| `WPW_fusionbeat.ECGsimcase` | 1,706,088 | 16,815,740; 16,816,546 | 16,864,752; 16,866,308; 16,867,410; 16,874,388 |

The large offset differences between cases occur before the volume conductor and source/lead-system blocks. This is consistent with case-specific matrix payload sizes near the start of the file.

## Repeated High-Level Order

The observed object order is consistent across all four cases:

1. Root header: `PECGsimData`
2. `PECG`
3. Initial `PMatrix`
4. `PVolumeConductor`
5. First `PGeometry`
6. Two `PGraphGeometry` blocks with several small/empty `PMatrix` entries
7. Several large `PMatrix` blocks
8. Seven additional `PGeometry` entries
9. More `PMatrix` blocks
10. Two `PSource` blocks with nested `PSourceParameter`, `PVector`, and `PActivationConstruction`
11. Four `PLeadSystem` blocks with nested `PLead`, `PLeadReference`, and `PShowLead`

## Lead Systems

Every case contains four lead systems:

| File | Lead systems |
| --- | --- |
| `normal_male2.ECGsimcase` | `standard_12`, `VCG_(Frank)`, `BSM_(nijmegen_64)`, `minimap_montage` |
| `WPW_Bundleonly.ECGsimcase` | `standard_12`, `VCG_(Frank)`, `BSM_(amsterdam_64)`, `minimap_montage` |
| `WPW_ectopicbeat.ECGsimcase` | `standard_12`, `VCG_(Frank)`, `BSM_(amsterdam_64)`, `minimap_montage` |
| `WPW_fusionbeat.ECGsimcase` | `standard_12`, `VCG_(Frank)`, `BSM_(amsterdam_64)`, `minimap_montage` |

The `PLeadSystem` marker is followed by a name string and then numeric payloads that look like little-endian float coordinates. For `standard_12`, the name is followed by `uint32_le 9`, then 9 groups of three float-like values, likely electrode positions.

## Early Numeric Observations

These observations are useful for the later metadata loader but should be verified before parser implementation:

- Object markers appear to be followed by a little-endian `uint32` version field. Most sampled objects have version `1`.
- The first `PMatrix` starts at offset 54. After the marker and version, it includes little-endian integer fields `300` and `1000`, followed by float-like data.
- `PGeometry` samples contain a version field, a count-like integer, then repeated little-endian float triplets. The manual export format uses coordinates in meters, but case internals may use scaled display coordinates; units are not yet confirmed.
- `PVector` appears as a small object marker followed by version and length/payload fields.

## Relationship To Export Reader

`research/source/www.ecgsim.org/downloads/readECGsim.m` reads exported directory structures, not `.ECGsimcase` files directly. It is still valuable because it names the expected logical components:

- `model/` geometries: atria, ventricle, thorax, lungs, blood cavities.
- adjacency and distance matrices.
- transfer matrices from atria/ventricles to thorax, atria, ventricles, lungs, and cavities.
- lead-system transfer matrices.
- `ecgs/` measured and simulated ECG matrices plus electrode positions.
- atrial and ventricular beat source parameters.

The `.ECGsimcase` markers line up with that vocabulary: `PGeometry`, `PMatrix`, `PSource`, `PSourceParameter`, and `PLeadSystem`.

## Open Questions For Parser Work

- Exact primitive layout of each object type.
- Whether geometry coordinates are stored in meters, millimeters, or display units.
- Which `PMatrix` corresponds to each exported matrix name.
- Which `PSource` is atrial versus ventricular.
- Whether initial and adapted parameter values are both stored in the case or derived at load time.
- Whether the first `PECG`/`PMatrix` block is measured ECG data, simulated ECG data, or another time series.
- How string/object version fields change across ECGSIM versions older than 3.0.

## Next Parser Target

`ecgsim.io.read_ecgsimcase_metadata` was added for task 0006. It:

1. validates the `PECGsimData` root string,
2. extracts all length-prefixed UTF-16LE strings with offsets,
3. counts known `P...` markers,
4. extracts lead-system names,
5. reports major block offsets.

It intentionally does not parse numeric payloads inside `PMatrix`, `PGeometry`, `PSource`, `PVector`, or lead objects yet. Those unsupported payload groups are exposed on the returned metadata so callers do not mistake marker inventory for full case loading.

The next `.ECGsimcase`-specific parser task is `docs/tasks/0007-add-case-metadata-cli.md`.
