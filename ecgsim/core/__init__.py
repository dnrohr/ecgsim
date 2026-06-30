"""Core domain objects and validation for ECGSIM data."""

from ecgsim.core.activation import ActivationEdge, ActivationFocus, fastest_route_activation_times
from ecgsim.core.filtering import BaselineWindow, FilteringMode, baseline_window_for_signal, filter_matrix, filter_signal
from ecgsim.core.parity import (
    NumericComparison,
    NumericMismatch,
    assert_numeric_sequences_close,
    compare_numeric_sequences,
)
from ecgsim.core.tmp import (
    TMPParameters,
    generate_tmp_waveform,
    generate_tmp_waveform_from_vectors,
    tmp_parameters_from_vectors,
)
from ecgsim.core.transfer import apply_transfer_function, apply_wct_reference

__all__ = [
    "FilteringMode",
    "ActivationEdge",
    "ActivationFocus",
    "BaselineWindow",
    "NumericComparison",
    "NumericMismatch",
    "TMPParameters",
    "apply_transfer_function",
    "apply_wct_reference",
    "assert_numeric_sequences_close",
    "baseline_window_for_signal",
    "compare_numeric_sequences",
    "filter_matrix",
    "filter_signal",
    "fastest_route_activation_times",
    "generate_tmp_waveform",
    "generate_tmp_waveform_from_vectors",
    "tmp_parameters_from_vectors",
]
