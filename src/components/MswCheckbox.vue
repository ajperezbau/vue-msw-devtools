<template>
  <label class="filter-label" :style="labelStyle">
    <input
      type="checkbox"
      :checked="modelValue"
      @change="
        $emit('update:modelValue', ($event.target as HTMLInputElement).checked)
      "
      class="filter-checkbox"
    />
    <slot></slot>
  </label>
</template>

<script setup lang="ts">
defineProps<{
  modelValue: boolean;
  labelStyle?: any;
}>();

defineEmits<{
  (e: "update:modelValue", value: boolean): void;
}>();
</script>

<style scoped>
.filter-label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--text-secondary);
  cursor: pointer;
  user-select: none;
}

.filter-checkbox {
  width: 1rem;
  height: 1rem;
  cursor: pointer;
  accent-color: var(--accent-color);
}
</style>
