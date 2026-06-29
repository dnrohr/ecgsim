"""Core domain objects and validation for ECGSIM data."""

from ecgsim.core.tmp import (
    TMPParameters,
    generate_tmp_waveform,
    generate_tmp_waveform_from_vectors,
    tmp_parameters_from_vectors,
)
from ecgsim.core.transfer import apply_transfer_function, apply_wct_reference

__all__ = [
    "TMPParameters",
    "apply_transfer_function",
    "apply_wct_reference",
    "generate_tmp_waveform",
    "generate_tmp_waveform_from_vectors",
    "tmp_parameters_from_vectors",
]
