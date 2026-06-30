"""Activation-sequence helpers for fastest-route propagation models."""

from __future__ import annotations

from dataclasses import dataclass
import heapq
import math
from typing import Iterable


@dataclass(frozen=True)
class ActivationEdge:
    """Undirected source-graph edge used by fastest-route activation."""

    node_a: int
    node_b: int
    length: float
    velocity: float


@dataclass(frozen=True)
class ActivationFocus:
    """Initial activation site and start time."""

    node: int
    time: float = 0.0


def fastest_route_activation_times(
    node_count: int,
    edges: Iterable[ActivationEdge],
    foci: Iterable[ActivationFocus],
) -> tuple[float, ...]:
    """Compute first-arrival activation times from one or more foci.

    Edge travel time is ``length / velocity``. Edges are treated as undirected,
    matching the graph-distance formulation used by fastest-route descriptions.
    """

    if node_count < 0:
        raise ValueError("node_count must be non-negative")

    graph: list[list[tuple[int, float]]] = [[] for _ in range(node_count)]
    for edge in edges:
        _validate_node(edge.node_a, node_count)
        _validate_node(edge.node_b, node_count)
        if edge.length < 0:
            raise ValueError("edge length must be non-negative")
        if edge.velocity <= 0:
            raise ValueError("edge velocity must be positive")
        travel_time = edge.length / edge.velocity
        graph[edge.node_a].append((edge.node_b, travel_time))
        graph[edge.node_b].append((edge.node_a, travel_time))

    activation_times = [math.inf] * node_count
    queue: list[tuple[float, int]] = []
    for focus in foci:
        _validate_node(focus.node, node_count)
        if not math.isfinite(focus.time):
            raise ValueError("focus time must be finite")
        if focus.time < activation_times[focus.node]:
            activation_times[focus.node] = focus.time
            heapq.heappush(queue, (focus.time, focus.node))

    while queue:
        current_time, node = heapq.heappop(queue)
        if current_time > activation_times[node]:
            continue
        for neighbor, travel_time in graph[node]:
            next_time = current_time + travel_time
            if next_time < activation_times[neighbor]:
                activation_times[neighbor] = next_time
                heapq.heappush(queue, (next_time, neighbor))

    return tuple(activation_times)


def _validate_node(node: int, node_count: int) -> None:
    if node < 0 or node >= node_count:
        raise ValueError(f"node index {node} outside 0..{node_count - 1}")
