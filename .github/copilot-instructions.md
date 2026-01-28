# Copilot Instructions

## Terminal & Commands

- When running Playwright tests, always use the `--reporter=line` or `--reporter=list` flag to prevent the reporter from hanging the terminal with an interactive HTML report on failure.
- Example: `npx playwright test --reporter=line`
- Do not use commands that require user intervention to terminate unless specifically requested.
