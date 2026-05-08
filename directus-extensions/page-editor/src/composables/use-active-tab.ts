import { ref, watch } from 'vue';

const STORAGE_KEY = 'page-editor-active-tab';

export function useActiveTab(defaultTab = 'home') {
  const activeTab = ref(localStorage.getItem(STORAGE_KEY) || defaultTab);

  watch(activeTab, (newVal) => {
    localStorage.setItem(STORAGE_KEY, newVal);
  });

  return { activeTab };
}
