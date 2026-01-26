# MSW Devtools Plugin

A powerful browser-based UI for managing [Mock Service Worker (MSW)](https://mswjs.io/) handlers in Vue 3 applications. This library allows you to dynamically switch between different response scenarios, override responses on the fly, and inspect network activity handled by MSW.

## Features

- 🛠 **Dynamic Scenario Switching**: Define multiple response scenarios for a single endpoint and switch between them without reloading.
- ✍️ **Manual Overrides**: Edit response status codes and bodies (JSON or Text) directly in the browser.
- ⏱ **Network Simulation**: Set global or per-handler delays to simulate different network conditions.
- 📋 **Activity Log**: View a history of all requests handled by MSW, including request/response bodies with JSON path filtering.
- 💾 **Persistence**: All your settings (active scenarios, delays, overrides) are persisted in `localStorage`.
- 🔗 **URL Parameters Sync**: Deep-link to specific mock scenarios using URL query parameters.
- ✨ **Custom Scenarios**: Save manual overrides as reusable custom scenarios.

## Installation

```bash
npm install msw-devtools-plugin
# or
pnpm add msw-devtools-plugin
```

## Setup

### 1. Register the Vue Plugin

Add the devtools to your Vue application:

```typescript
import { createApp } from "vue";
import { MswDevtoolsPlugin } from "msw-devtools-plugin";
import App from "./App.vue";

const app = createApp(App);

// Only install in development
if (process.env.NODE_ENV === "development") {
  app.use(MswDevtoolsPlugin);
}

app.mount("#app");
```

### 2. Initialize MSW Registry

In your MSW entry point (usually `mocks/browser.ts`):

```typescript
import { setupWorker } from "msw/browser";
import { setupMswRegistry } from "msw-devtools-plugin";

export const worker = setupWorker();

// Initialize the registry with your worker instance
setupMswRegistry(worker);
```

## Defining Handlers

Use the fluent `register` API to define handlers with multiple scenarios:

```typescript
import { register } from "msw-devtools-plugin";
import { HttpResponse } from "msw";

register("getProfile")
  .url("/api/profile")
  .method("get")
  .scenario("default", () => {
    return HttpResponse.json({ id: 1, name: "John Doe" });
  })
  .scenario("empty", () => {
    return HttpResponse.json({});
  })
  .scenario("not-found", () => {
    return new HttpResponse(null, { status: 404 });
  })
  .defaultScenario("default")
  .build();
```

### Advanced Usage

#### Priority Handling

Handlers with higher priority will be matched first by MSW.

```typescript
register("getUserAdmin").url("/api/user/admin").priority(10).build();
```

#### Global Delay

You can control network latency globally or per handler from the Devtools UI.

## UI Usage

Once installed, a floating gear icon will appear in your application.

- **Registry Tab**: View all registered handlers, change active scenarios, and set individual delays.
- **Activity Log Tab**: See real-time request logs. Click on an entry to inspect request/response bodies.
- **Manual Override**: Click the edit icon on any handler to manually define a fix response.
- **Apply & Reload**: Some changes might require a page reload to ensure consistency.

## Keyboard Shortcuts

- `Ctrl + Shift + M`: Toggle Devtools panel.
- `Ctrl + Enter`: Apply changes and reload page (when panel is open).
