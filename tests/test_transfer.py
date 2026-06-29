import unittest

from ecgsim.core import apply_transfer_function, apply_wct_reference
from ecgsim.io import MatrixData, read_matrix


class TransferFunctionTests(unittest.TestCase):
    def test_applies_transfer_matrix_to_source_matrix(self) -> None:
        transfer = ((1.0, 2.0, 3.0), (0.5, -1.0, 4.0))
        source = ((10.0, 20.0), (1.0, 2.0), (-1.0, 3.0))

        output = apply_transfer_function(transfer, source)

        self.assertEqual(output.rows, 2)
        self.assertEqual(output.columns, 2)
        self.assertEqual(output.storage_format, "computed-transfer")
        self.assertEqual(output.values, ((9.0, 33.0), (0.0, 20.0)))

    def test_accepts_matrix_data_inputs(self) -> None:
        transfer = MatrixData(rows=1, columns=2, values=((2.0, -1.0),))
        source = MatrixData(rows=2, columns=2, values=((3.0, 4.0), (5.0, 6.0)))

        output = apply_transfer_function(transfer, source)

        self.assertEqual(output.values, ((1.0, 2.0),))

    def test_rejects_shape_mismatch(self) -> None:
        with self.assertRaisesRegex(ValueError, "transfer columns"):
            apply_transfer_function(((1.0, 2.0),), ((1.0,), (2.0,), (3.0,)))

    def test_applies_wct_reference(self) -> None:
        transfer = (
            (10.0, 20.0),
            (4.0, 8.0),
            (6.0, 10.0),
        )

        referenced = apply_wct_reference(transfer, (1, 2))

        self.assertEqual(referenced.rows, 3)
        self.assertEqual(referenced.columns, 2)
        self.assertEqual(referenced.values[0], (5.0, 11.0))
        self.assertEqual(referenced.values[1], (-1.0, -1.0))
        self.assertEqual(referenced.values[2], (1.0, 1.0))

    def test_archived_transfer_matrix_computes_expected_dimensions_and_samples(self) -> None:
        transfer = read_matrix("research/source/www.ecgsim.org/downloads/other13/geometry/wct.tra")
        source = tuple(
            tuple(1.0 if row == column else 0.0 for column in range(3))
            for row in range(transfer.columns)
        )

        output = apply_transfer_function(transfer, source)

        self.assertEqual(output.rows, 300)
        self.assertEqual(output.columns, 3)
        self.assertAlmostEqual(output.values[0][0], transfer.values[0][0], delta=1e-12)
        self.assertAlmostEqual(output.values[0][1], transfer.values[0][1], delta=1e-12)
        self.assertAlmostEqual(output.values[0][2], transfer.values[0][2], delta=1e-12)


if __name__ == "__main__":
    unittest.main()
