"""Python + Playwright migration package for the MCP automation framework."""

__all__ = [
    "ConfigManager",
    "ApplicationConfig",
    "PromptExecutor",
]

from .config_manager import ApplicationConfig, ConfigManager
from .executor import PromptExecutor
