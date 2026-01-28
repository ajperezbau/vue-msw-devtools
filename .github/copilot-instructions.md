# Copilot Instructions

## Terminal & Commands

- When running Playwright tests, always use the `--reporter=line` or `--reporter=list` flag to prevent the reporter from hanging the terminal with an interactive HTML report on failure.
- Example: `npx playwright test --reporter=line`
- Do not use commands that require user intervention to terminate unless specifically requested.

## Testing Guidelines

- **Semantic Locators:** Prefer using Playwright's semantic locators like `getByRole`, `getByLabel`, `getByPlaceholder`, `getByText`, or `getByTestId` over CSS classes or ID-based locators. This ensures better accessibility and test robustness.
- **Role usage:** When targetting elements, use their ARIA roles (e.g., `heading`, `button`, `row`, `cell`, `textbox`).
