<template>
  <div class="tab-bar">
    <button
      v-for="tab in tabs"
      :key="tab.id"
      :class="['tab', { active: tab.id === activeTab }]"
      @click="$emit('update:activeTab', tab.id)"
    >
      <v-icon :name="tab.icon" />
      <span>{{ tab.label }}</span>
    </button>
  </div>
</template>

<script setup lang="ts">
import type { PageTab } from '../types';

defineProps<{
  tabs: PageTab[];
  activeTab: string;
}>();

defineEmits<{
  'update:activeTab': [value: string];
}>();
</script>

<style scoped>
.tab-bar {
  display: flex;
  gap: 8px;
  padding: 16px 24px;
  border-bottom: 1px solid var(--border-subdued);
  background: var(--background-page);
}

.tab {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  padding: 12px 20px;
  border: 1px solid var(--border-subdued);
  border-radius: 8px;
  background: var(--background-normal);
  cursor: pointer;
  transition: all 0.15s ease;
  color: var(--foreground-normal);
}

.tab:hover {
  border-color: var(--primary);
  background: var(--background-normal-alt);
}

.tab.active {
  border-color: var(--primary);
  background: var(--primary-alt);
  color: var(--primary);
}

.tab span {
  font-size: 13px;
  font-weight: 500;
}
</style>
