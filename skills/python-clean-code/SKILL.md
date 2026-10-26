---
name: python-clean-code
description: Verify and clean Python code to common community standards (PEP 8/257/484, black, isort, flake8, mypy, pytest) before a change is called done. Use when the user asks to verify, review, lint, tidy or "clean code" Python, or at the end of an implementation step in the AiDM repo.
---

# Python clean code — verify + clean

Goal: the changed code reads like idiomatic, well-maintained Python and passes the repo's own tooling. Clean **only what the change touched** — never reformat or refactor untouched upstream code (it creates merge conflicts and review noise). If something outside the diff looks wrong, report it instead of fixing it.

## 1. Find the scope
- `git diff --cached --name-only` (and `git diff --name-only`) → the `.py` files in play.
- For each file, look only at the changed hunks (`git diff -U0 <base> -- <file>`); new files are fully in scope.

## 2. Run the repo's tools (AiDM: config in root `pyproject.toml`)
Run from the repo root with the project venv (`.venv/Scripts/python.exe -m …` on Windows):
- `black --check --diff <files>` — line length 100, target py313
- `isort --check-only --diff <files>` — profile black, line length 100
- `flake8 <files>` — max-line-length 100, ignores E203/W503
- `mypy <files>` — strict; report new errors only (compare against the base if the file already had errors)
- `pytest` — the affected tests first, then the full suite against the base baseline (never a hand-picked subset as the final check)

Apply black/isort fixes **only to new files or new functions**. For existing files, fix only the lines inside our hunks by hand — do not run the formatter over the whole file if that would rewrite untouched lines. If a tool isn't installed, say so; don't silently skip.

## 3. Review checklist (changed code)
**Structure and imports**
- All imports at the top of the module, grouped stdlib / third-party / first-party (isort order). A local import only to break a real circular dependency or a heavy optional import, with a 1-line comment explaining why.
- No unused imports, variables, parameters or dead code; no commented-out code.
- One responsibility per function; extract a helper when a block repeats ≥2 times (especially in tests: shared fixtures and builders).

**Naming and types**
- `snake_case` functions and variables, `PascalCase` classes, `UPPER_CASE` module constants, a leading `_` for module-private names.
- Type hints on every new function signature (params + return), modern syntax (`list[str]`, `X | None`).
- Names say what something is (`version_ids`, not `ids2`); no single letters except trivial loop indices.

**Correctness and idioms**
- No bare `except:`; catch the narrowest exception. A broad `except Exception` only at a deliberate boundary, and it must log.
- f-strings for formatting; `pathlib` for paths; context managers for files, sessions and locks.
- No mutable default arguments; no shadowing builtins (`id`, `type`, `list`).
- Async: never call blocking I/O inside `async def` (wrap it in `asyncio.to_thread`); every coroutine is awaited.
- SQL: parameterised (`:name`), never string-formatted values.

**Comments and docstrings** (PEP 257)
- Comments explain *why*, 1–2 lines max; no narration of what the code obviously does.
- Docstrings on public functions/modules; keep them true after the change (migration numbers, AC ids, behaviour).

**Tests** (pytest)
- Test names state the behaviour (`test_cancel_drops_the_versions_vectors`); a docstring links the requirement (e.g. AC id).
- Arrange / act / assert is visible; one behaviour per test; prefer fixtures and builders over copy-paste.
- No real external calls from unit tests; integration tests are marked `@pytest.mark.integration` and clean up only what they created (never drop shared tables or collections).

## 4. Report
Give a short table: file → tool results (pass/fail) → what was cleaned → anything left (with reason, e.g. "pre-existing in base, out of scope"). Ask before any cleanup that changes behaviour or touches code outside the diff.
