# Architecture Documentation

## Core Principles

### State Management

The global state is reactive and resides exclusively in [src/mswRegistry.ts](src/mswRegistry.ts).

- **Rule:** Do not use Pinia, Vuex, or any other state management library.
- **Implementation:** Use Vue's `reactive` and `ref` to export shared state.
- **Persistence:** User-created content (Custom Scenarios, Presets, Overrides) is persisted to `localStorage` via handlers in [src/mswRegistry.ts](src/mswRegistry.ts).

### Communication

Component hierarchy and communication:

- **Structure:** [src/mswDevtools.vue](src/mswDevtools.vue) is the root component that acts as a container.
- **Pattern:** Child components (`views` inside `src/components/`) communicate with the parent ([src/mswDevtools.vue](src/mswDevtools.vue)) using `emits`.
- **Orchestration:** The parent component orchestrates tab switching, modal visibility, and cross-component coordination.

### Styles and Theming

The project uses a custom theming system based on standard CSS.

- **Technology:** Native CSS only.
- **Rule:** Do not use Tailwind CSS or any external UI libraries.
- **Theming:** Use CSS variables (e.g., `var(--bg-main)`) for all colors and spacing to support Light/Dark modes.
- **Scoping:** Styles should be scoped within components to avoid leakage.

### Type System

[src/types.ts](src/types.ts) is the "Single Source of Truth" for all TypeScript interfaces.

- **Rule:** Avoid defining interfaces locally within components if they are shared or represent core data structures.
- **Maintenance:** Update [src/types.ts](src/types.ts) when modifying the structure of logs, presets, configuration, or scenarios.

## Component Structure

- `MswDevtools.vue`: Main entry point and layout.
- `RegistryView.vue`: Handler listing, filtering, and status management.
- `PresetsView.vue`: Management and application of scenario groups.
- `ActivityLogView.vue`: Inspection of intercepted requests and responses.
- `OverrideEditor.vue`: UI for creating custom response overrides.
