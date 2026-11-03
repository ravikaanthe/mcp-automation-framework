from __future__ import annotations

import argparse
from pathlib import Path

from .executor import PromptExecutor


def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(description="Python + Playwright execution engine for the MCP automation framework")
    parser.add_argument("--app", default="orangehrm", help="Application config to load from config/app-configs")
    parser.add_argument("--file", help="Specific prompt file to execute")
    parser.add_argument("--suite", help="Prompt suite to execute by name")
    parser.add_argument("--browser", choices=["chromium", "firefox", "webkit"], default="chromium")
    parser.add_argument("--headed", action="store_true", help="Show the browser window")
    parser.add_argument("--verbose", action="store_true", help="Enable verbose output")
    parser.add_argument("--list-apps", action="store_true", help="List available app configs")
    return parser


def main() -> int:
    parser = build_parser()
    args = parser.parse_args()

    if args.list_apps:
        from .config_manager import ConfigManager
        for app in ConfigManager.get_available_configs():
            print(app)
        return 0

    executor = PromptExecutor(
        app=args.app,
        browser=args.browser,
        headed=args.headed,
        file=args.file,
        suite=args.suite,
        verbose=args.verbose,
    )
    summary = executor.run()
    print(f"\n✅ Execution complete: {summary['passed_prompts']}/{summary['total_prompts']} passed")
    return 0 if summary["failed_prompts"] == 0 else 1


if __name__ == "__main__":
    raise SystemExit(main())
