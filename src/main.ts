import { createApp } from "vue";
import {
  MswDevtoolsPlugin,
  MswHandlerBuilder,
  setupMswRegistry,
} from "./index";
import { setupWorker } from "msw/browser";

const app = createApp({});

// Define some example handlers to test
new MswHandlerBuilder("users")
  .url("/api/users")
  .method("get")
  .scenario("default", () => {
    return new Response(JSON.stringify([{ id: 1, name: "John" }]), {
      status: 200,
    });
  })
  .scenario("empty", () => {
    return new Response(JSON.stringify([]), { status: 200 });
  })
  .build();

new MswHandlerBuilder("products").url("/api/products").method("post").build();

const worker = setupWorker();
setupMswRegistry(worker);

app.use(MswDevtoolsPlugin);
app.mount("#app");
