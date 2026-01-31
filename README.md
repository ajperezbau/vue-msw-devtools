# MSW Devtools Plugin

A powerful browser-based UI for managing [Mock Service Worker (MSW)](https://mswjs.io/) handlers in Vue 3 applications. This library allows you to dynamically switch between different response scenarios, override responses on the fly, and inspect network activity handled by MSW.

## Features

- 🛠 **Dynamic Scenario Switching**: Define multiple response scenarios for a single endpoint and switch between them without reloading.
- ✍️ **Manual Overrides**: Edit response status codes and bodies (JSON or Text) directly in the browser.
- ⏱ **Network Simulation**: Set global or per-handler delays to simulate different network conditions.
- 📋 **Activity Log**: View a history of all requests handled by MSW, including request/response bodies with JSON path filtering.
- � **Zero-Config Discovery**: Automatically detects existing MSW handlers without changing your code.
- �💾 **Persistence**: All your settings (active scenarios, delays, overrides) are persisted in `localStorage`.
- 🔗 **URL Parameters Sync**: Deep-link to specific mock scenarios using URL query parameters.
- ✨ **Custom Scenarios**: Save manual overrides as reusable custom scenarios.

## Installation

```bash
npm install msw-devtools-plugin
# or
pnpm add msw-devtools-plugin
```

## Setup

### Step-by-Step Integration

You can integrate the devtools with a single line in your application entry point:

```typescript
import { createApp } from "vue";
import { setupWorker } from "msw/browser";
import { MswDevtoolsPlugin } from "msw-devtools-plugin";
import App from "./App.vue";

const app = createApp(App);

// 1. Setup MSW as usual
const worker = setupWorker();
await worker.start();

// 2. Install the plugin and pass the worker instance
if (process.env.NODE_ENV === "development") {
  app.use(MswDevtoolsPlugin, {
    worker,
    // Optional: add handlers that shouldn't be controlled by the UI
    baseHandlers: [],
    // Optional: resolve dynamic URLs (e.g. removing IDs) to group them
    urlResolver: (url) => url.replace(/\/\d+/g, "/:id"),
  });
}

app.mount("#app");
```

### Advanced Usage

If you prefer to keep MSW initialization separate, you can still use the previous method:

```typescript
import { setupMswRegistry, MswDevtoolsPlugin } from "msw-devtools-plugin";

// ... setup worker
setupMswRegistry(worker);
app.use(MswDevtoolsPlugin);
```

### Zero Config Discovery

The plugin now automatically detects any existing handlers you have already registered in your MSW worker. They will appear in the DevTools UI under a default scenario named "original", allowing you to immediately:

- Set delays for existing handlers.
- See them in the Activity Log.
- Apply manual overrides.

No changes are needed to your existing MSW code beyond the initial setup!

## Defining Handlers

You have two ways to define your mock handlers:

### 1. Declarative (Recommended)

Use `defineHandlers` to register multiple endpoints at once.

```typescript
import { defineHandlers } from "msw-devtools-plugin";
import { HttpResponse } from "msw";

defineHandlers({
  users: {
    url: "/api/users",
    method: "get",
    scenarios: {
      success: () => HttpResponse.json([{ id: 1, name: "John" }]),
      empty: () => HttpResponse.json([]),
      error: () => new HttpResponse(null, { status: 500 }),
    },
  },
});
```

### 2. Fluent API

Use `register` (alias of `MswHandlerBuilder`) for a more programmatic approach.

```typescript
import { register } from "msw-devtools-plugin";
import { HttpResponse } from "msw";

register("profile")
  .url("/api/profile")
  .method("get")
  .scenario("default", () => {
    return HttpResponse.json({ id: 1, name: "John Doe" });
  })
  .scenario("anonymous", () => {
    return HttpResponse.json({ id: null, name: "Guest" });
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
