import unittest

import ecgsim


class PackageSmokeTests(unittest.TestCase):
    def test_package_imports(self) -> None:
        self.assertEqual(ecgsim.__version__, "0.1.0")


if __name__ == "__main__":
    unittest.main()
