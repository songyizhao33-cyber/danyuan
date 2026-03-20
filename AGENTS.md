# Repository Guidelines

## Project Structure & Module Organization
This repository is currently an asset workspace, not an application codebase. The top-level directory contains `参考图/`, which stores reference images used for design or content work. Keep new visual assets in that folder unless a clearer subfolder is needed, such as `参考图/mobile/` or `参考图/archive/`.

Place any future source code in a dedicated root such as `src/`, tests in `tests/`, and generated output in `dist/` or `build/`. Do not mix code, exports, and raw references in the same directory.

## Build, Test, and Development Commands
There is no build, test, or local run pipeline configured in the current repository state. Before introducing tooling, keep contributions limited to organized assets and documentation.

If code is added later, document the exact commands here. Example patterns:

```bash
npm install
npm test
npm run build
```

## Coding Style & Naming Conventions
Use descriptive, stable names for new files and folders. Prefer lowercase ASCII names with hyphens for new directories and documentation, for example `reference-images/landing-page.png`. Existing filenames in `参考图/` are accepted as legacy imports and should not be renamed unless there is a clear cleanup task.

For Markdown, use short sections, sentence-case prose, and fenced code blocks for commands. If source code is introduced, use the formatter and linter standard to that stack and record it in this guide.

## Testing Guidelines
No automated tests are present yet. If you add code, add a matching test suite in `tests/` or next to the module using the project’s chosen framework. Name tests after the unit under test, such as `header.test.js` or `test_header.py`.

For asset changes, verify:
- file paths are correct
- images open successfully
- large binaries are intentional and relevant

## Commit & Pull Request Guidelines
Git history is not available in this workspace, so no commit convention can be inferred. Use short, imperative commit messages such as `Add homepage reference images` or `Document asset structure`.

Pull requests should include a clear summary, the purpose of the added or changed assets, and screenshots or thumbnails when the visual change matters. Call out renamed, removed, or unusually large files explicitly.

## Asset Management Notes
Avoid duplicate images with unclear names. Prefer one canonical file per asset and move superseded versions into an `archive/` folder instead of leaving near-identical copies in the main reference set.
