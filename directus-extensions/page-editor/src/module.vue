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
import { useActiveTab } from './composables/use-active-tab';
import TabBar from './components/tab-bar.vue';
import TabContent from './components/tab-content.vue';

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
