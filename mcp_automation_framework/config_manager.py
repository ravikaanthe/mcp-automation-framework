from __future__ import annotations

import json
from dataclasses import dataclass, field
from pathlib import Path
from typing import Any


@dataclass
class DefaultCredentials:
    username: str = ""
    password: str = ""


@dataclass
class ApplicationConfig:
    name: str
    version: str = "1.0.0"
    description: str = ""
    base_url: str = ""
    default_credentials: DefaultCredentials = field(default_factory=DefaultCredentials)
    elements: dict[str, dict[str, str]] = field(default_factory=dict)
    test_context: str = ""
    environment: dict[str, Any] = field(default_factory=dict)

    @classmethod
    def from_dict(cls, payload: dict[str, Any]) -> "ApplicationConfig":
        credentials = payload.get("defaultCredentials") or {}
        return cls(
            name=payload.get("name", ""),
            version=payload.get("version", "1.0.0"),
            description=payload.get("description", ""),
            base_url=payload.get("baseUrl", ""),
            default_credentials=DefaultCredentials(
                username=credentials.get("username", ""),
                password=credentials.get("password", ""),
            ),
            elements=payload.get("elements", {}),
            test_context=payload.get("testContext", ""),
            environment=payload.get("environment", {}),
        )


class ConfigManager:
    """Load and expose application configs originally stored in JSON."""

    _cache: dict[str, ApplicationConfig] = {}

    @classmethod
    def load_config(cls, app_name: str) -> ApplicationConfig:
        key = app_name.lower()
        if key in cls._cache:
            return cls._cache[key]

        repo_root = Path(__file__).resolve().parent.parent
        config_dir = repo_root / "config" / "app-configs"
        config_path = config_dir / f"{key}.json"

        if not config_path.exists():
            raise FileNotFoundError(f"Application config not found: {config_path}")

        payload = json.loads(config_path.read_text(encoding="utf-8"))
        config = ApplicationConfig.from_dict(payload)
        cls._cache[key] = config
        return config

    @classmethod
    def get_available_configs(cls) -> list[str]:
        repo_root = Path(__file__).resolve().parent.parent
        config_dir = repo_root / "config" / "app-configs"
        if not config_dir.exists():
            return []
        return sorted([p.stem for p in config_dir.glob("*.json")])
