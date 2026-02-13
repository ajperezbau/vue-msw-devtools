<template>
  <MswToggle v-model="isOpen" />

  <div v-if="isOpen" class="modal-backdrop" @click.self="isOpen = false">
    <div
      class="modal-content"
      :class="'theme-' + theme"
      role="dialog"
      aria-modal="true"
      aria-labelledby="msw-devtools-title"
    >
      <div class="panel-header">
        <h2 id="msw-devtools-title" class="panel-title">MSW Devtools</h2>
        <div class="tab-buttons">
          <button
            type="button"
            @click="activeTab = 'registry'"
            class="tab-button"
            :class="{ active: activeTab === 'registry' }"
          >
            Registry
          </button>
          <button
            type="button"
            @click="activeTab = 'presets'"
            class="tab-button"
            :class="{ active: activeTab === 'presets' }"
          >
            Presets
          </button>
          <button
            type="button"
            @click="activeTab = 'log'"
            class="tab-button"
            :class="{ active: activeTab === 'log' }"
          >
            Activity Log ({{ activityLog.length }})
          </button>
        </div>
        <div class="panel-actions">
          <button
            type="button"
            @click="toggleTheme"
            class="theme-toggle-button"
            :title="
              theme === 'light' ? 'Switch to Dark Mode' : 'Switch to Light Mode'
            "
          >
            <svg
              v-if="theme === 'light'"
              xmlns="http://www.w3.org/2000/svg"
              class="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />
            </svg>
            <svg
              v-else
              xmlns="http://www.w3.org/2000/svg"
              class="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <circle cx="12" cy="12" r="4" />
              <path d="M12 2v2" />
              <path d="M12 20v2" />
              <path d="m4.93 4.93 1.41 1.41" />
              <path d="m17.66 17.66 1.41 1.41" />
              <path d="M2 12h2" />
              <path d="M20 12h2" />
              <path d="m6.34 17.66-1.41 1.41" />
              <path d="m19.07 4.93-1.41 1.41" />
            </svg>
          </button>
          <div class="button-group">
            <button
              type="button"
              @click="showExportDialog = true"
              class="export-button"
              title="Export scenarios to JSON"
              aria-label="Export Scenarios"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                class="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"
                />
              </svg>
            </button>
            <button
              type="button"
              @click="triggerImport"
              class="import-button"
              title="Import scenarios from JSON"
              aria-label="Import Scenarios"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                class="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                />
              </svg>
            </button>
            <button
              v-if="activeTab === 'registry'"
              type="button"
              @click="registryViewRef?.toggleSelectionMode()"
              class="import-button"
              :class="{ active: registryViewRef?.isSelectionMode }"
              title="Select handlers to create a preset"
              aria-label="Create Preset"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                class="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"
                />
              </svg>
            </button>
          </div>
          <button
            v-if="activeTab === 'log'"
            type="button"
            @click="clearActivityLog"
            class="clear-button"
            title="Clear log"
          >
            Clear Log
          </button>
          <input
            type="file"
            ref="importFile"
            style="display: none"
            accept=".json"
            @change="handleImport"
          />
          <div class="reset-menu-container" ref="resetMenuContainer">
            <button
              type="button"
              @click="showResetMenu = !showResetMenu"
              class="clear-button reset-button"
              :class="{ 'menu-open': showResetMenu }"
              title="Reset options"
            >
              Reset
              <svg
                xmlns="http://www.w3.org/2000/svg"
                class="h-4 w-4 ml-2 transition-transform"
                :class="{ 'rotate-180': showResetMenu }"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </button>
            <div v-if="showResetMenu" class="reset-dropdown">
              <button type="button" @click="resetScenariosOnly">
                Reset Scenarios Only
              </button>
              <button type="button" @click="clearConfigs" class="danger">
                Reset All (Full)
              </button>
            </div>
          </div>
          <button
            type="button"
            @click="reloadPage"
            class="reload-button"
            title="Apply & Reload (Ctrl + Enter)"
          >
            Apply & Reload
          </button>
          <button
            type="button"
            @click="isOpen = false"
            class="close-button"
            title="Close"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>
      </div>

      <RegistryView
        v-if="activeTab === 'registry'"
        ref="registryViewRef"
        @open-override="openOverrideEditor"
        @view-log="viewLogForKey"
        @preset-created="activeTab = 'presets'"
      />

      <!-- Export Options Dialog -->
      <div v-if="showExportDialog" class="override-editor-overlay">
        <div class="override-editor-content">
          <div class="editor-header">
            <h3>Export Options</h3>
            <button
              type="button"
              @click="showExportDialog = false"
              class="close-button"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                class="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
          <div class="editor-body">
            <p style="margin-bottom: 1rem; color: var(--text-secondary)">
              Select what you want to include in the export:
            </p>
            <div class="export-options-list">
              <MswCheckbox
                v-model="allOptionsSelected"
                :label-style="{
                  marginBottom: '1rem',
                  paddingBottom: '0.75rem',
                  borderBottom: '1px solid var(--border-color)',
                }"
              >
                <span style="font-weight: 700">Select All</span>
              </MswCheckbox>
              <MswCheckbox
                v-model="exportOptions.scenarios"
                :label-style="{ marginBottom: '0.75rem' }"
              >
                Active Scenarios Selection
              </MswCheckbox>
              <MswCheckbox
                v-model="exportOptions.customScenarios"
                :label-style="{ marginBottom: '0.75rem' }"
              >
                Custom Handlers (JSON scenarios)
              </MswCheckbox>
              <MswCheckbox
                v-model="exportOptions.customPresets"
                :label-style="{ marginBottom: '0.75rem' }"
              >
                Custom Presets (Recipes)
              </MswCheckbox>
              <MswCheckbox
                v-model="exportOptions.overrides"
                :label-style="{ marginBottom: '0.75rem' }"
              >
                Manual Overrides
              </MswCheckbox>
              <MswCheckbox
                v-model="exportOptions.delays"
                :label-style="{ marginBottom: '0.75rem' }"
              >
                Handler Delays
              </MswCheckbox>
              <MswCheckbox
                v-model="exportOptions.globalDelay"
                :label-style="{ marginBottom: '0.75rem' }"
              >
                Global Delay Settings
              </MswCheckbox>
            </div>
          </div>
          <div class="editor-footer">
            <button
              type="button"
              @click="showExportDialog = false"
              class="secondary-button"
            >
              Cancel
            </button>
            <div class="spacer"></div>
            <button
              type="button"
              @click="exportScenarios"
              class="primary-button"
              :disabled="Object.values(exportOptions).every((v) => !v)"
            >
              Download JSON
            </button>
          </div>
        </div>
      </div>

      <OverrideEditor
        v-if="editingOverrideKey"
        :editing-key="editingOverrideKey"
        :initial-data="initialOverrideData"
        @close="editingOverrideKey = null"
      />

      <PresetsView v-if="activeTab === 'presets'" />

      <ActivityLogView
        v-if="activeTab === 'log'"
        v-model:filterKey="logFilterKey"
        @open-override="openOverrideEditorFromLog"
        @view-handler="viewHandlerForKey"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref, watch } from "vue";
import MswCheckbox from "./components/MswCheckbox.vue";
import MswToggle from "./components/MswToggle.vue";
import RegistryView from "./components/RegistryView.vue";
import PresetsView from "./components/PresetsView.vue";
import ActivityLogView from "./components/ActivityLogView.vue";
import OverrideEditor from "./components/OverrideEditor.vue";
import {
  activityLog,
  clearActivityLog,
  customOverrides,
  customPresets,
  customScenarios,
  globalDelay,
  handlerDelays,
  scenarioRegistry,
  scenarioState,
  type LogEntry,
} from "./mswRegistry";

const isOpen = ref(false);
const activeTab = ref<"registry" | "log" | "presets">("registry");
const registryViewRef = ref<any>(null);
const resetMenuContainer = ref<HTMLElement | null>(null);

const theme = ref<"light" | "dark">(
  (localStorage.getItem("msw-devtools-theme") as "light" | "dark") || "dark",
);

const showExportDialog = ref(false);
const exportOptions = ref({
  scenarios: true,
  delays: true,
  overrides: true,
  customScenarios: true,
  customPresets: true,
  globalDelay: true,
});

const allOptionsSelected = computed({
  get: () => Object.values(exportOptions.value).every((v) => v),
  set: (value) => {
    Object.keys(exportOptions.value).forEach((key) => {
      (exportOptions.value as any)[key] = value;
    });
  },
});

const toggleTheme = () => {
  theme.value = theme.value === "light" ? "dark" : "light";
  localStorage.setItem("msw-devtools-theme", theme.value);
};

const logFilterKey = ref<string | null>(null);

const editingOverrideKey = ref<string | null>(null);
const initialOverrideData = ref<{ body: string; status: number } | null>(null);

const openOverrideEditor = (key: string) => {
  initialOverrideData.value = null; // Clear previous log data if any
  editingOverrideKey.value = key;
};

const openOverrideEditorFromLog = (entry: LogEntry) => {
  initialOverrideData.value = {
    body: formatBody(entry.responseBody),
    status: entry.status,
  };
  editingOverrideKey.value = entry.key;
};

const viewLogForKey = (key: string) => {
  logFilterKey.value = key;
  activeTab.value = "log";
};

const viewHandlerForKey = (_key: string) => {
  activeTab.value = "registry";
};

const formatBody = (body: unknown) => {
  if (body === undefined || body === null) return "";
  if (typeof body === "string") return body;
  return JSON.stringify(body, null, 2);
};

const handleKeyDown = (e: KeyboardEvent) => {
  if (e.key === "Escape" && isOpen.value) {
    isOpen.value = false;
  }

  // Toggle with Ctrl + Shift + M
  if (
    (e.ctrlKey || e.metaKey) &&
    e.shiftKey &&
    (e.key === "M" || e.key === "m")
  ) {
    e.preventDefault();
    isOpen.value = !isOpen.value;
  }

  // Apply & Reload with Ctrl + Enter
  if ((e.ctrlKey || e.metaKey) && e.key === "Enter" && isOpen.value) {
    e.preventDefault();
    reloadPage();
  }
};

const reloadPage = () => {
  isOpen.value = false;
  window.location.reload();
};

onMounted(() => {
  window.addEventListener("keydown", handleKeyDown);
  document.addEventListener("click", handleOutsideClick);
});

onUnmounted(() => {
  window.removeEventListener("keydown", handleKeyDown);
  document.removeEventListener("click", handleOutsideClick);
});

const showResetMenu = ref(false);

const handleOutsideClick = (event: MouseEvent) => {
  if (
    showResetMenu.value &&
    resetMenuContainer.value &&
    !resetMenuContainer.value.contains(event.target as Node)
  ) {
    showResetMenu.value = false;
  }
};

const resetScenariosOnly = () => {
  Object.keys(scenarioState).forEach((key) => {
    const handler = scenarioRegistry[key];
    scenarioState[key] = handler?.isNative ? "original" : "default";
  });

  // Also clear overrides as they affects the scenario returned
  Object.keys(customOverrides).forEach((key) => {
    delete customOverrides[key];
  });

  showResetMenu.value = false;
};

const clearConfigs = () => {
  // eslint-disable-next-line no-alert
  const confirmed = window.confirm(
    "This will clear all saved scenarios, delays, overrides, and presets. Are you sure?",
  );
  if (!confirmed) {
    showResetMenu.value = false;
    return;
  }

  localStorage.removeItem("msw-scenarios");
  localStorage.removeItem("msw-delay");
  localStorage.removeItem("msw-handler-delays");
  localStorage.removeItem("msw-overrides");
  localStorage.removeItem("msw-custom-scenarios");
  localStorage.removeItem("msw-custom-presets");

  // Reset all scenarios to their appropriate default in the reactive state
  Object.keys(scenarioState).forEach((key) => {
    const handler = scenarioRegistry[key];
    scenarioState[key] = handler?.isNative ? "original" : "default";
  });

  // Reset all handler delays to 0
  Object.keys(handlerDelays).forEach((key) => {
    handlerDelays[key] = 0;
  });

  // Clear all overrides
  Object.keys(customOverrides).forEach((key) => {
    delete customOverrides[key];
  });

  // Clear all custom scenarios
  Object.keys(customScenarios).forEach((key) => {
    delete customScenarios[key];
  });

  // Re-sync scenarioRegistry with original scenarios (removing custom ones)
  Object.keys(scenarioRegistry).forEach((key) => {
    const handler = scenarioRegistry[key];
    if (handler && handler.originalScenarios) {
      handler.scenarios = [...handler.originalScenarios];
    }
  });

  // Clear custom presets
  customPresets.splice(0, customPresets.length);

  // Reset global delay
  globalDelay.value = 0;

  showResetMenu.value = false;
};

const exportScenarios = () => {
  const data: any = {
    version: 1,
    timestamp: Date.now(),
  };

  if (exportOptions.value.scenarios) {
    data.scenarios = scenarioState;
  }
  if (exportOptions.value.delays) {
    data.delays = handlerDelays;
  }
  if (exportOptions.value.overrides) {
    data.overrides = customOverrides;
  }
  if (exportOptions.value.customScenarios) {
    data.customScenarios = customScenarios;
  }
  if (exportOptions.value.customPresets) {
    data.customPresets = customPresets;
  }
  if (exportOptions.value.globalDelay) {
    data.globalDelay = globalDelay.value;
  }

  const blob = new Blob([JSON.stringify(data, null, 2)], {
    type: "application/json",
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `msw-scenarios-${new Date().toISOString().split("T")[0]}.json`;
  link.click();
  URL.revokeObjectURL(url);
  showExportDialog.value = false;
};

const importFile = ref<HTMLInputElement | null>(null);

const triggerImport = () => {
  importFile.value?.click();
};

const handleImport = (event: Event) => {
  const target = event.target as HTMLInputElement;
  const file = target.files?.[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = (e) => {
    try {
      const data = JSON.parse(e.target?.result as string);

      if (data.scenarios) {
        Object.keys(scenarioState).forEach((key) => {
          delete scenarioState[key];
        });
        Object.assign(scenarioState, data.scenarios);
      }
      if (data.delays) {
        Object.keys(handlerDelays).forEach((key) => {
          delete handlerDelays[key];
        });
        Object.assign(handlerDelays, data.delays);
      }
      if (data.overrides) {
        Object.keys(customOverrides).forEach((key) => {
          delete customOverrides[key];
        });
        Object.assign(customOverrides, data.overrides);
      }
      if (data.customScenarios) {
        Object.keys(customScenarios).forEach((key) => {
          delete customScenarios[key];
        });
        Object.assign(customScenarios, data.customScenarios);
      }
      if (data.customPresets && Array.isArray(data.customPresets)) {
        customPresets.splice(0, customPresets.length, ...data.customPresets);
      }
      if (data.globalDelay !== undefined) {
        globalDelay.value = data.globalDelay;
      }

      // eslint-disable-next-line no-alert
      alert(
        "Scenarios imported successfully. Page will reload to apply changes.",
      );
      reloadPage();
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error("Failed to import scenarios:", err);
      // eslint-disable-next-line no-alert
      alert("Failed to import scenarios. Invalid file format.");
    } finally {
      target.value = ""; // Reset input
    }
  };
  reader.readAsText(file);
};

watch(isOpen, (newValue) => {
  if (newValue) {
    // focusSearch(); // Logic moved to child
  }
});
</script>

<style scoped>
.modal-content.theme-light {
  --bg-main: #ffffff;
  --bg-secondary: #fafafa;
  --bg-tertiary: #f4f4f5;
  --text-main: #09090b;
  --text-secondary: #52525b;
  --text-tertiary: #71717a;
  --border-color: #e4e4e7;
  --accent-color: #ff6a33;
  --accent-hover: #e65a2b;
  --accent-soft: rgba(255, 106, 51, 0.1);
  --input-bg: #ffffff;
  --table-hover: #fafafa;
  --table-header-bg: #fafafa;
  --modal-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.15);
}

.modal-content.theme-dark {
  --bg-main: #18181b;
  --bg-secondary: #27272a;
  --bg-tertiary: #3f3f46;
  --text-main: #fafafa;
  --text-secondary: #d4d4d8;
  --text-tertiary: #a1a1aa;
  --border-color: #3f3f46;
  --accent-color: #ff6a33;
  --accent-hover: #ff8559;
  --accent-soft: rgba(255, 106, 51, 0.15);
  --input-bg: #121212;
  --table-hover: #27272a;
  --table-header-bg: #18181b;
  --modal-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
}

.h-6 {
  height: 1.5rem;
}
.w-6 {
  width: 1.5rem;
}
.h-5 {
  height: 1.25rem;
}
.w-5 {
  width: 1.25rem;
}
.h-4 {
  height: 1rem;
}
.w-4 {
  width: 1rem;
}
.h-3 {
  height: 0.75rem;
}
.w-3 {
  width: 0.75rem;
}
.ml-1 {
  margin-left: 0.25rem;
}
.ml-2 {
  margin-left: 0.5rem;
}

.modal-backdrop {
  position: fixed;
  inset: 0;
  background-color: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
  z-index: 10001;
  font-family:
    system-ui,
    -apple-system,
    sans-serif;
  user-select: none;
}

.modal-content {
  background-color: var(--bg-main);
  color: var(--text-main);
  border-radius: 1rem;
  width: 100%;
  max-width: 1600px;
  height: 95vh;
  box-shadow: var(--modal-shadow);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  border: 1px solid var(--border-color);
}

.modal-content * {
  scrollbar-width: thin;
  scrollbar-color: var(--bg-tertiary) transparent;
}

.modal-content *::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}

.modal-content *::-webkit-scrollbar-track {
  background: transparent;
}

.modal-content *::-webkit-scrollbar-thumb {
  background-color: var(--bg-tertiary);
  border-radius: 20px;
}

.modal-content *::-webkit-scrollbar-thumb:hover {
  background-color: var(--border-color);
}

.panel-header {
  padding: 1rem 1.5rem;
  display: flex;
  align-items: center;
  background-color: var(--bg-main);
  border-bottom: 1px solid var(--border-color);
}

.panel-title {
  font-size: 1.25rem;
  font-weight: 800;
  color: var(--text-main);
  margin: 0;
}

.tab-buttons {
  display: flex;
  gap: 0.5rem;
  margin: 0 1.5rem;
  background-color: var(--bg-tertiary);
  padding: 0.25rem;
  border-radius: 0.75rem;
}

.tab-button {
  padding: 0.5rem 1rem;
  font-size: 0.875rem;
  font-weight: 700;
  border-radius: 0.5rem;
  border: none;
  background: transparent;
  color: var(--text-tertiary);
  cursor: pointer;
  transition: all 0.2s;
}

.tab-button:hover {
  background-color: var(--bg-secondary);
  color: var(--text-main);
}

.tab-button.active {
  background-color: var(--bg-main);
  color: var(--accent-color);
  box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1);
}

.panel-actions {
  display: flex;
  gap: 0.75rem;
  margin-left: auto;
  align-items: center;
}

.clear-button,
.export-button,
.import-button,
.theme-toggle-button {
  background-color: var(--bg-main);
  color: var(--text-secondary);
  padding: 0.5rem 1rem;
  border-radius: 0.5rem;
  font-size: 0.875rem;
  font-weight: 600;
  border: 1px solid var(--border-color);
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
}

.export-button,
.import-button,
.theme-toggle-button {
  padding: 0.5rem;
  width: 2.5rem;
  height: 2.5rem;
}

.button-group {
  display: flex;
  align-items: center;
}

.button-group button {
  border-radius: 0;
  margin-left: -1px;
}

.button-group button:first-child {
  border-top-left-radius: 0.5rem;
  border-bottom-left-radius: 0.5rem;
  margin-left: 0;
}

.button-group button:last-child {
  border-top-right-radius: 0.5rem;
  border-bottom-right-radius: 0.5rem;
}

.button-group button.active {
  background-color: var(--accent-color);
  border-color: var(--accent-color);
  color: white;
  z-index: 2;
}

.clear-button:hover,
.export-button:hover,
.import-button:hover,
.theme-toggle-button:hover {
  background-color: var(--bg-tertiary);
  border-color: var(--accent-color);
  color: var(--accent-color);
  z-index: 1;
}

.reload-button {
  background-color: var(--accent-color);
  color: white;
  padding: 0.5rem 1.25rem;
  border-radius: 0.5rem;
  font-size: 0.875rem;
  font-weight: 600;
  border: none;
  cursor: pointer;
  transition: background-color 0.2s;
}

.reload-button:hover {
  background-color: var(--accent-hover);
}

.reset-menu-container {
  position: relative;
}

.reset-dropdown {
  position: absolute;
  top: 100%;
  right: 0;
  margin-top: 0.5rem;
  background-color: var(--bg-main);
  border: 1px solid var(--border-color);
  border-radius: 0.5rem;
  box-shadow:
    0 4px 6px -1px rgba(0, 0, 0, 0.1),
    0 2px 4px -1px rgba(0, 0, 0, 0.06);
  z-index: 100;
  min-width: 180px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.reset-dropdown button {
  padding: 0.75rem 1rem;
  text-align: left;
  background: none;
  border: none;
  color: var(--text-secondary);
  font-size: 0.875rem;
  cursor: pointer;
  transition: background-color 0.2s;
  white-space: nowrap;
}

.reset-dropdown button:hover {
  background-color: var(--bg-tertiary);
  color: var(--accent-color);
}

.reset-dropdown button.danger {
  color: #ef4444;
  border-top: 1px solid var(--border-color);
}

.reset-dropdown button.danger:hover {
  background-color: #fef2f2;
}

.theme-dark .reset-dropdown button.danger:hover {
  background-color: #450a0a;
}

.reset-button.menu-open {
  border-color: var(--accent-color);
  color: var(--accent-color);
}

.transition-transform {
  transition: transform 0.2s;
}

.rotate-180 {
  transform: rotate(180deg);
}

.close-button {
  background: none;
  border: none;
  color: var(--text-tertiary);
  cursor: pointer;
  padding: 0.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 0.5rem;
}

.close-button:hover {
  background-color: var(--bg-tertiary);
  color: var(--text-main);
}

.export-options-list {
  display: flex;
  flex-direction: column;
  padding: 0.5rem 0;
}

.override-editor-overlay {
  position: absolute;
  inset: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 100;
  padding: 2rem;
}

.override-editor-content {
  background-color: var(--bg-main);
  border-radius: 0.75rem;
  width: 100%;
  max-width: 600px;
  display: flex;
  flex-direction: column;
  box-shadow: var(--modal-shadow);
  max-height: 80vh;
  border: 1px solid var(--border-color);
}
</style>
