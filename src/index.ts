import { createApp, h, type Plugin } from "vue";
import MswDevtools from "./mswDevtools.vue";
import { setupMswRegistry } from "./mswRegistry";

export * from "./mswRegistry";
export { MswDevtools };

export interface MswDevtoolsOptions {
  worker?: any;
  baseHandlers?: any[];
  urlResolver?: (url: string) => string;
}

export const MswDevtoolsPlugin: Plugin<MswDevtoolsOptions[]> = {
  install(app, options) {
    if (typeof window === "undefined") return;

    const opts = Array.isArray(options) ? options[0] : options;

    if (opts?.worker) {
      setupMswRegistry(opts.worker, opts.baseHandlers, opts.urlResolver);
    }

    if (document.getElementById("msw-devtools-plugin-root")) return;

    const container = document.createElement("div");
    container.id = "msw-devtools-plugin-root";
    document.body.appendChild(container);

    const devtoolsApp = createApp({
      render: () => h(MswDevtools),
    });

    devtoolsApp.mount(container);
  },
};
