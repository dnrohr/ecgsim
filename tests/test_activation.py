import math
import unittest

from ecgsim.core import ActivationEdge, ActivationFocus, fastest_route_activation_times


class ActivationTests(unittest.TestCase):
    def test_fastest_route_uses_first_arriving_focus(self) -> None:
        times = fastest_route_activation_times(
            4,
            (
                ActivationEdge(0, 1, length=2.0, velocity=1.0),
                ActivationEdge(1, 2, length=2.0, velocity=1.0),
                ActivationEdge(2, 3, length=2.0, velocity=1.0),
                ActivationEdge(0, 3, length=10.0, velocity=1.0),
            ),
            (
                ActivationFocus(0, time=0.0),
                ActivationFocus(3, time=1.0),
            ),
        )

        self.assertEqual(times, (0.0, 2.0, 3.0, 1.0))

    def test_fastest_route_uses_edge_velocity(self) -> None:
        times = fastest_route_activation_times(
            3,
            (
                ActivationEdge(0, 1, length=2.0, velocity=2.0),
                ActivationEdge(1, 2, length=3.0, velocity=1.5),
            ),
            (ActivationFocus(0, time=5.0),),
        )

        self.assertEqual(times, (5.0, 6.0, 8.0))

    def test_unreachable_nodes_remain_infinite(self) -> None:
        times = fastest_route_activation_times(
            3,
            (ActivationEdge(0, 1, length=1.0, velocity=1.0),),
            (ActivationFocus(0),),
        )

        self.assertEqual(times[:2], (0.0, 1.0))
        self.assertTrue(math.isinf(times[2]))

    def test_rejects_invalid_edges_and_foci(self) -> None:
        with self.assertRaisesRegex(ValueError, "velocity"):
            fastest_route_activation_times(2, (ActivationEdge(0, 1, 1.0, 0.0),), (ActivationFocus(0),))

        with self.assertRaisesRegex(ValueError, "outside"):
            fastest_route_activation_times(2, (), (ActivationFocus(2),))


if __name__ == "__main__":
    unittest.main()
