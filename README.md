# MCP Automation Framework

This repository has been migrated from a TypeScript/Node + Playwright model to a Python + Playwright implementation while preserving the original configuration-driven, prompt-based automation structure.

## What was preserved

- `config/app-configs/*.json` app configuration model
- `prompts/*.txt` and `prompts/*.prompt` natural-language test definitions
- `prompts/regression-suite.json` suite definitions
- Multi-browser execution concept: Chromium, Firefox, WebKit
- CI-style execution flow and result reporting

## Python entrypoints

### Quick start

```bash
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
python -m playwright install
python -m mcp_automation_framework --app orangehrm --file VerifyBuzzPostVerification.txt
```

### Alternate runner

```bash
python runner.py --app orangehrm --suite smoke
python runner.py --app orangehrm --browser firefox --headed
python runner.py --list-apps
```

## Repo structure

```text
mcp_automation_framework/
├── __init__.py
├── __main__.py
├── cli.py
├── config_manager.py
├── executor.py
config/
├── app-configs/
prompts/
results/
runner.py
playwright.config.py
requirements.txt
pyproject.toml
```

## Notes

The Python executor loads the same app config JSON files and executes prompt files in the same style as the original TypeScript runner. The migration keeps the framework concept intact while moving the runtime to Python + Playwright.

## Next steps

- expand the prompt parser for more complex natural-language flows
- add stricter browser selectors for OrangeHRM elements
- add richer HTML/JSON test reports and CI publishing
- convert the remaining test fixtures and docs to Python-first guidance
