"""Vercel Python function; local development still uses the standalone backend."""
import sys
from pathlib import Path

# Vercel may preserve the monorepo prefix or flatten the project root in the bundle.
for root in [Path(__file__).resolve().parents[1], Path(__file__).resolve().parents[2]]:
    source = root / "backend" / "src"
    if (source / "ads_optimizer" / "api.py").is_file():
        sys.path.insert(0, str(source))
        break

from ads_optimizer.api import app  # noqa: E402, F401
