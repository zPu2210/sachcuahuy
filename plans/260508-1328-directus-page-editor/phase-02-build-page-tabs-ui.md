---
phase: 2
title: "Build Page Tabs UI"
status: pending
priority: P1
effort: "2h"
dependencies: [1]
---

# Phase 2: Build Page Tabs UI

## Overview

Build the tab navigation UI with 4 page groups: Trang Chủ, Sách, Giới Thiệu, Cài Đặt. Each tab shows a different form panel. Use Directus's built-in UI components for consistency.

## Requirements

### Functional
- 4 tabs with icons: Trang Chủ (🏠), Sách (📖), Giới Thiệu (👤), Cài Đặt (⚙️)
- Active tab indicator
- Tab content panel switches based on selection
- Persist selected tab in URL/localStorage

### Non-functional
- Match Directus admin theme (light/dark mode support)
- Responsive layout
- <100ms tab switch

## Architecture

```
┌──────────────────────────────────────────────────────┐
│ 📝 Quản Lý Nội Dung                                  │
├──────────────────────────────────────────────────────┤
│  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐    │
│  │ 🏠      │ │ 📖      │ │ 👤      │ │ ⚙️      │    │
│  │ Trang   │ │ Sách    │ │ Giới    │ │ Cài     │    │
│  │ Chủ     │ │         │ │ Thiệu   │ │ Đặt     │    │
│  └─────────┘ └─────────┘ └─────────┘ └─────────┘    │
│       ▲                                              │
│       └── active indicator                           │
├──────────────────────────────────────────────────────┤
│                                                       │
│  <TabContent />  ← renders based on activeTab        │
│                                                       │
└──────────────────────────────────────────────────────┘
```

## Related Code Files

### Modify
- `directus-extensions/page-editor/src/module.vue`

### Create
- `directus-extensions/page-editor/src/components/TabBar.vue`
- `directus-extensions/page-editor/src/components/TabContent.vue`
- `directus-extensions/page-editor/src/composables/useActiveTab.ts`

## Implementation Steps

### 1. Define tab configuration

```typescript
// src/types.ts
export interface PageTab {
  id: string;
  label: string;
  icon: string;
}

export const PAGE_TABS: PageTab[] = [
  { id: 'home', label: 'Trang Chủ', icon: 'home' },
  { id: 'books', label: 'Sách', icon: 'menu_book' },
  { id: 'about', label: 'Giới Thiệu', icon: 'person' },
  { id: 'settings', label: 'Cài Đặt', icon: 'settings' },
];
```

### 2. Create TabBar component

```vue
<!-- src/components/TabBar.vue -->
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
import { defineProps, defineEmits } from 'vue';
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
```

### 3. Create useActiveTab composable

```typescript
// src/composables/useActiveTab.ts
import { ref, watch } from 'vue';

const STORAGE_KEY = 'page-editor-active-tab';

export function useActiveTab(defaultTab = 'home') {
  const activeTab = ref(localStorage.getItem(STORAGE_KEY) || defaultTab);

  watch(activeTab, (newVal) => {
    localStorage.setItem(STORAGE_KEY, newVal);
  });

  return { activeTab };
}
```

### 4. Create TabContent placeholder

```vue
<!-- src/components/TabContent.vue -->
<template>
  <div class="tab-content">
    <component :is="contentComponent" />
  </div>
</template>

<script setup lang="ts">
import { computed, defineAsyncComponent } from 'vue';

const props = defineProps<{
  activeTab: string;
}>();

// Phase 3 will create these components
const HomeForm = defineAsyncComponent(() => import('./forms/HomeForm.vue'));
const BooksForm = defineAsyncComponent(() => import('./forms/BooksForm.vue'));
const AboutForm = defineAsyncComponent(() => import('./forms/AboutForm.vue'));
const SettingsForm = defineAsyncComponent(() => import('./forms/SettingsForm.vue'));

const contentComponent = computed(() => {
  switch (props.activeTab) {
    case 'home': return HomeForm;
    case 'books': return BooksForm;
    case 'about': return AboutForm;
    case 'settings': return SettingsForm;
    default: return HomeForm;
  }
});
</script>

<style scoped>
.tab-content {
  padding: 24px;
  min-height: 400px;
}
</style>
```

### 5. Update main module.vue

```vue
<!-- src/module.vue -->
<template>
  <private-view title="Quản Lý Nội Dung">
    <template #title-outer:prepend>
      <v-button class="header-icon" rounded icon secondary>
        <v-icon name="edit_note" />
      </v-button>
    </template>

    <div class="page-editor">
      <TabBar
        :tabs="PAGE_TABS"
        :activeTab="activeTab"
        @update:activeTab="activeTab = $event"
      />
      <TabContent :activeTab="activeTab" />
    </div>
  </private-view>
</template>

<script setup lang="ts">
import { PAGE_TABS } from './types';
import { useActiveTab } from './composables/useActiveTab';
import TabBar from './components/TabBar.vue';
import TabContent from './components/TabContent.vue';

const { activeTab } = useActiveTab();
</script>

<style scoped>
.page-editor {
  background: var(--background-page);
  min-height: 100%;
}

.header-icon {
  --v-button-background-color: var(--primary-10);
  --v-button-color: var(--primary);
}
</style>
```

### 6. Create placeholder form components (for Phase 3)

```vue
<!-- src/components/forms/HomeForm.vue -->
<template>
  <div class="form-placeholder">
    <h2>Trang Chủ</h2>
    <p>Đang tải form...</p>
  </div>
</template>
```

Repeat for BooksForm, AboutForm, SettingsForm.

## Success Criteria

- [ ] 4 tabs render with icons and Vietnamese labels
- [ ] Clicking tab switches content panel
- [ ] Active tab persists on page refresh
- [ ] Matches Directus dark/light theme
- [ ] No console errors

## Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Directus CSS vars unavailable | Low | Medium | Fall back to hardcoded colors |
| v-icon not imported | Medium | Low | Import from @directus/extensions-sdk |
| private-view component missing | Low | High | Check Directus 11 docs for correct wrapper |
