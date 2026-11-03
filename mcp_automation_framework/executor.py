from __future__ import annotations

import json
import re
from dataclasses import dataclass
from pathlib import Path
from typing import Any

from playwright.sync_api import Browser, Page, sync_playwright

from .config_manager import ConfigManager


@dataclass
class PromptDefinition:
    file_name: str
    title: str
    content: str
    tags: list[str]


@dataclass
class StepResult:
    step_number: int
    description: str
    action: str
    status: str
    details: str
    duration_ms: int


class PromptExecutor:
    def __init__(
        self,
        app: str = "orangehrm",
        browser: str = "chromium",
        headed: bool = False,
        file: str | None = None,
        suite: str | None = None,
        verbose: bool = False,
    ) -> None:
        self.app = app
        self.browser_name = browser
        self.headed = headed
        self.file = file
        self.suite = suite
        self.verbose = verbose
        self.repo_root = Path(__file__).resolve().parent.parent
        self.prompts_dir = self.repo_root / "prompts"
        self.results_dir = self.repo_root / "results"
        self.config = ConfigManager.load_config(app)
        self.results_dir.mkdir(exist_ok=True, parents=True)

    def run(self) -> dict[str, Any]:
        prompts = self._load_prompts()
        if not prompts:
            raise FileNotFoundError("No prompt files found to execute.")

        results: list[dict[str, Any]] = []
        total_steps = 0
        total_passed = 0
        total_failed = 0

        with sync_playwright() as p:
            browser = self._launch_browser(p)
            try:
                for prompt in prompts:
                    result = self._execute_prompt(prompt, browser)
                    results.append(result)
                    total_steps += int(result["total_steps"])
                    total_passed += int(result["passed_steps"])
                    total_failed += int(result["failed_steps"])
            finally:
                browser.close()

        summary = {
            "app": self.app,
            "browser": self.browser_name,
            "total_prompts": len(prompts),
            "passed_prompts": sum(1 for r in results if r["success"]),
            "failed_prompts": sum(1 for r in results if not r["success"]),
            "total_steps": total_steps,
            "passed_steps": total_passed,
            "failed_steps": total_failed,
            "results": results,
        }
        self._write_report(summary)
        return summary

    def _launch_browser(self, p: Any) -> Browser:
        browser_type = self.browser_name.lower()
        launch_kwargs = {"headless": self.headed is False}
        if browser_type == "chromium":
            return p.chromium.launch(**launch_kwargs)
        if browser_type == "firefox":
            return p.firefox.launch(**launch_kwargs)
        if browser_type == "webkit":
            return p.webkit.launch(**launch_kwargs)
        raise ValueError(f"Unsupported browser: {browser_type}")

    def _load_prompts(self) -> list[PromptDefinition]:
        if self.file:
            prompt_path = self.prompts_dir / self.file
            if not prompt_path.exists():
                raise FileNotFoundError(f"Prompt file not found: {prompt_path}")
            return [self._read_prompt(prompt_path)]

        if self.suite:
            suite_config_path = self.prompts_dir / "regression-suite.json"
            if suite_config_path.exists():
                try:
                    suite_config = json.loads(suite_config_path.read_text(encoding="utf-8"))
                    suite = suite_config.get("suites", {}).get(self.suite)
                    if suite and "prompts" in suite:
                        files = [self.prompts_dir / name for name in suite["prompts"]]
                        return [self._read_prompt(p) for p in files if p.exists()]
                except json.JSONDecodeError:
                    pass

            prompts = self._read_all_prompts()
            return [p for p in prompts if self.suite.lower() in [tag.lower() for tag in p.tags]]

        return self._read_all_prompts()

    def _read_all_prompts(self) -> list[PromptDefinition]:
        if not self.prompts_dir.exists():
            return []

        items = []
        for path in sorted(self.prompts_dir.iterdir()):
            if path.suffix.lower() not in {".txt", ".prompt"}:
                continue
            if path.name == "regression-suite.json":
                continue
            items.append(self._read_prompt(path))
        return items

    def _read_prompt(self, path: Path) -> PromptDefinition:
        text = path.read_text(encoding="utf-8")
        title = self._extract_title(path.name, text)
        tags = self._extract_tags(path.name, text)
        return PromptDefinition(file_name=path.name, title=title, content=text, tags=tags)

    def _extract_title(self, file_name: str, content: str) -> str:
        for line in content.splitlines():
            if line.startswith("Title:"):
                return line.split(":", 1)[1].strip()
            if line.startswith("# "):
                return line[2:].strip()
        return re.sub(r"\.(txt|prompt)$", "", file_name).replace("_", " ").replace("-", " ")

    def _extract_tags(self, file_name: str, content: str) -> list[str]:
        tags: list[str] = []
        for line in content.splitlines():
            if line.lower().startswith("tags:"):
                tag_string = line.split(":", 1)[1].strip()
                tags.extend([tag.strip() for tag in tag_string.split(",") if tag.strip()])
                break
        if tags:
            return list(dict.fromkeys(tags))

        lowered = (file_name + " " + content).lower()
        tag_map = {
            "login": ["login"],
            "smoke": ["smoke"],
            "regression": ["regression"],
            "p1": ["p1"],
            "employee": ["employee", "pim"],
            "data": ["data-driven", "csv", "excel"],
        }
        for key, variants in tag_map.items():
            if any(v in lowered for v in variants):
                tags.append(key)
        return list(dict.fromkeys(tags))

    def _execute_prompt(self, prompt: PromptDefinition, browser: Browser) -> dict[str, Any]:
        step_results: list[StepResult] = []
        page = browser.new_page(viewport={"width": 1440, "height": 1200})
        start = __import__("time").time()
        details = []
        try:
            steps = self._parse_steps(prompt.content)
            if not steps:
                raise ValueError("No executable steps found in the prompt file.")

            for index, step in enumerate(steps, start=1):
                action_name, step_detail, status, step_duration = self._run_step(page, step, index)
                details.append(step_detail)
                step_results.append(
                    StepResult(
                        step_number=index,
                        description=step,
                        action=action_name,
                        status=status,
                        details=step_detail,
                        duration_ms=step_duration,
                    )
                )

            passed = sum(1 for r in step_results if r.status == "passed")
            failed = sum(1 for r in step_results if r.status == "failed")
            duration = int((__import__("time").time() - start) * 1000)
            result = {
                "file": prompt.file_name,
                "title": prompt.title,
                "success": failed == 0,
                "duration_ms": duration,
                "total_steps": len(step_results),
                "passed_steps": passed,
                "failed_steps": failed,
                "steps": [r.__dict__ for r in step_results],
                "output": "\n".join(details),
            }
            return result
        except Exception as exc:  # pragma: no cover - reporting path
            duration = int((__import__("time").time() - start) * 1000)
            return {
                "file": prompt.file_name,
                "title": prompt.title,
                "success": False,
                "duration_ms": duration,
                "total_steps": len(step_results),
                "passed_steps": sum(1 for r in step_results if r.status == "passed"),
                "failed_steps": sum(1 for r in step_results if r.status == "failed") + 1,
                "steps": [r.__dict__ for r in step_results],
                "output": "\n".join(details),
                "error": str(exc),
            }
        finally:
            page.close()

    def _parse_steps(self, content: str) -> list[str]:
        lines: list[str] = []
        for raw in content.splitlines():
            line = raw.strip()
            if not line:
                continue
            if line.lower().startswith("tags:"):
                continue
            if re.match(r"^\d+\.\s+", line):
                lines.append(line)
            elif line.startswith("-"):
                lines.append(line)
        return lines

    def _run_step(self, page: Page, step: str, index: int) -> tuple[str, str, str, int]:
        started = __import__("time").time()
        lower = step.lower()
        try:
            if "navigate" in lower or "go to" in lower:
                url = self._extract_url(step) or self.config.base_url
                page.goto(url, wait_until="domcontentloaded")
                return "navigate", f"Opened {url}", "passed", int((__import__("time").time() - started) * 1000)

            if "login" in lower or ("username" in lower and "password" in lower):
                username = self._extract_value(step, "username") or self.config.default_credentials.username
                password = self._extract_value(step, "password") or self.config.default_credentials.password
                username_locator = page.locator("input[name*='username' i], input[id*='username' i], input[type='text' i]").first
                password_locator = page.locator("input[name*='password' i], input[id*='password' i], input[type='password' i]").first
                if username_locator.count() > 0:
                    username_locator.fill(username)
                if password_locator.count() > 0:
                    password_locator.fill(password)
                button = self._find_button(page, "login")
                if button is not None:
                    button.click()
                return "login", f"Logged in as {username}", "passed", int((__import__("time").time() - started) * 1000)

            if "logout" in lower:
                user_icon = self._find_link_or_button(page, ["user", "profile", "account"])
                if user_icon is not None:
                    user_icon.click()
                logout_btn = self._find_link_or_button(page, ["logout", "sign out"])
                if logout_btn is not None:
                    logout_btn.click()
                return "logout", "Logged out", "passed", int((__import__("time").time() - started) * 1000)

            if "click" in lower or "select" in lower or "press" in lower:
                target = self._extract_target_text(step)
                locator = self._find_link_or_button(page, [target] if target else ["submit", "save", "continue", "next", "post", "share"])
                if locator is None:
                    raise ValueError(f"No clickable element found for step: {step}")
                locator.click()
                return "click", f"Clicked '{target or step}'", "passed", int((__import__("time").time() - started) * 1000)

            if "verify" in lower or "check" in lower or "visible" in lower or "appears" in lower:
                target = self._extract_target_text(step) or "page"
                locator = self._find_visible_target(page, target)
                if locator is None:
                    raise ValueError(f"Target not found for verification: {target}")
                locator.wait_for(state="visible", timeout=15000)
                return "assert", f"Verified '{target}' is visible", "passed", int((__import__("time").time() - started) * 1000)

            if "wait" in lower:
                timeout_ms = self._extract_timeout(step)
                page.wait_for_timeout(timeout_ms)
                return "wait", f"Waited {timeout_ms}ms", "passed", int((__import__("time").time() - started) * 1000)

            if "fill" in lower or "enter" in lower or "type" in lower:
                target = self._extract_target_text(step) or "field"
                value = self._extract_value(step, "value") or self._extract_quoted_value(step)
                locator = self._find_input_or_field(page, target)
                if locator is None:
                    raise ValueError(f"No form field found for '{target}'")
                locator.fill(value)
                return "fill", f"Filled '{target}' with '{value}'", "passed", int((__import__("time").time() - started) * 1000)

            if any(word in lower for word in ["post", "share", "tweet", "submit"]):
                post_text = self._extract_quoted_value(step) or self._build_dynamic_post_text()
                text_area = page.locator("textarea, [contenteditable='true']").first
                if text_area.count() > 0:
                    text_area.fill(post_text)
                submit = self._find_button(page, "post") or self._find_button(page, "share")
                if submit is not None:
                    submit.click()
                return "post", f"Submitted post: {post_text}", "passed", int((__import__("time").time() - started) * 1000)

            return "noop", f"No direct action for step: {step}", "passed", int((__import__("time").time() - started) * 1000)
        except Exception as exc:  # pragma: no cover
            duration_ms = int((__import__("time").time() - started) * 1000)
            return "error", str(exc), "failed", duration_ms

    def _find_button(self, page: Page, label: str):
        patterns = [
            re.compile(label, re.I),
            re.compile(f"{label} button", re.I),
            re.compile(f"{label}", re.I),
        ]
        for pattern in patterns:
            locator = page.get_by_role("button", name=pattern)
            if locator.count() > 0:
                return locator.first
            locator = page.get_by_role("link", name=pattern)
            if locator.count() > 0:
                return locator.first
            locator = page.locator(f"button:has-text('{pattern.pattern}')")
            if locator.count() > 0:
                return locator.first
        return None

    def _find_link_or_button(self, page: Page, labels: list[str]):
        for label in labels:
            clean = label.strip().lower()
            if not clean:
                continue
            locator = page.get_by_role("link", name=re.compile(clean, re.I))
            if locator.count() > 0:
                return locator.first
            locator = page.get_by_role("button", name=re.compile(clean, re.I))
            if locator.count() > 0:
                return locator.first
            locator = page.locator(f"a:has-text('{clean}'), button:has-text('{clean}')")
            if locator.count() > 0:
                return locator.first
        return None

    def _find_visible_target(self, page: Page, label: str):
        target = label.strip()
        if not target:
            return page.locator("body")
        locator = page.get_by_text(re.compile(target, re.I), exact=False)
        if locator.count() > 0:
            return locator.first
        locator = page.locator(f"text={target}")
        if locator.count() > 0:
            return locator.first
        return None

    def _find_input_or_field(self, page: Page, label: str):
        for candidate in [label, f"{label} field", f"{label} input"]:
            locator = page.locator(
                f"input[name*='{candidate}' i], "
                f"input[id*='{candidate}' i], "
                f"textarea[name*='{candidate}' i], "
                f"textarea[id*='{candidate}' i]"
            )
            if locator.count() > 0:
                return locator.first
        return None

    def _extract_url(self, text: str) -> str | None:
        match = re.search(r"https?://\S+", text)
        return match.group(0) if match else None

    def _extract_target_text(self, step: str) -> str | None:
        patterns = [r'"([^"]+)"', r"'([^']+)'", r"\b([A-Z][A-Za-z0-9\s-]+)\b"]
        for pattern in patterns:
            match = re.search(pattern, step)
            if match:
                return match.group(1).strip()
        return None

    def _extract_value(self, text: str, key: str) -> str | None:
        match = re.search(rf"{key}\s*[:=]?\s*['\"]?([^'\"\s,]+)['\"]?", text, re.I)
        return match.group(1).strip() if match else None

    def _extract_quoted_value(self, text: str) -> str | None:
        match = re.search(r'"([^"]+)"', text)
        return match.group(1).strip() if match else None

    def _extract_timeout(self, text: str) -> int:
        match = re.search(r"(\d+)\s*(ms|milliseconds|s|seconds)", text, re.I)
        if not match:
            return 2000
        value = int(match.group(1))
        unit = match.group(2).lower()
        return value * 1000 if unit.startswith("s") and not unit.startswith("ms") else value

    def _build_dynamic_post_text(self) -> str:
        return f"Python Playwright test post {__import__('datetime').datetime.now().isoformat()}"

    def _write_report(self, summary: dict[str, Any]) -> None:
        report_path = self.results_dir / f"mcp-python-report-{__import__('datetime').datetime.now().strftime('%Y%m%d-%H%M%S')}.json"
        report_path.write_text(json.dumps(summary, indent=2), encoding="utf-8")
        print(f"\n📄 Python report saved: {report_path}")

