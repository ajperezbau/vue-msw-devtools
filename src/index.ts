import { defineCustomElement } from "vue";
import MswDevtools from "./mswDevtools.ce.vue";
import { setupMswRegistry } from "./mswRegistry";
import type { MswDevtoolsOptions } from "./types";

export * from "./mswRegistry";

const MswDevtoolsElement = defineCustomElement(MswDevtools);

export function initMswDevtools(options: MswDevtoolsOptions): void {
  if (typeof window === "undefined") return;

  if (!options?.worker) {
    console.error(
      "[MswDevtools] A MSW worker instance is required. " +
        "Pass it via: initMswDevtools({ worker })",
    );
    return;
  }

  setupMswRegistry(options.worker, options.urlResolver);

  if (!customElements.get("msw-devtools")) {
    customElements.define("msw-devtools", MswDevtoolsElement);
  }

  if (!document.querySelector("msw-devtools")) {
    document.body.appendChild(document.createElement("msw-devtools"));
  }
}

export const MswDevtoolsPlugin = {
  install(_: any, options: MswDevtoolsOptions) {
    console.warn(
      "⚠️ DEPRECATION WARNING: '@ajperezbau/vue-msw-devtools' has been renamed to '@ajperezbau/msw-devtools'. " +
        "Please update your dependencies. The new package is framework-agnostic and works the same.",
    );
    initMswDevtools(options);
  },
};
