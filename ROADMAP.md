# Roadmap - MSW DevTools Plugin

## Planned Features

### 1. Passthrough Mode & Base URL Override

- Ability to redirect requests to a real backend URL instead of using mocked scenarios.
- Global `baseUrl` override to point all or specific handlers to a different environment (e.g., Staging, Production).

### 2. Response Recording (Snapshotting)

- Capture real responses from passthrough requests.
- Option to save these captured responses directly as new local scenarios for easy debugging and regression testing.

### 3. Environment Management

- Support for multiple environment configurations.
- UI selector to switch between `Local (Mocked)`, `Development`, `Staging`, etc.
- Persisted storage for custom environment URLs.

### 4. Technical Considerations

- **CORS:** Passthrough requests made from the browser are subject to CORS policies. Users might need to configure their backends to allow the development origin or use a local proxy (like Vite proxy).
- **Request Cloning:** Ensure request/response streams are cloned correctly to allow both forwarding and logging/recording.
