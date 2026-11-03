from pathlib import Path

ROOT = Path(__file__).resolve().parent

# Default Playwright configuration for the migrated Python project.
# This mirrors the original repo's browser intent while keeping execution
# environment-agnostic and scriptable from Python.
PLAYWRIGHT_CONFIG = {
    "test_dir": str(ROOT / "tests"),
    "timeout": 30000,
    "retries": 0,
    "headless": True,
    "browsers": ["chromium", "firefox", "webkit"],
    "report_dir": str(ROOT / "results"),
}

__all__ = ["PLAYWRIGHT_CONFIG"]
