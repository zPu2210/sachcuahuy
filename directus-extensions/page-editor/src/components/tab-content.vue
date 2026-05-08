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

const HomeForm = defineAsyncComponent(() => import('./forms/home-form.vue'));
const BooksForm = defineAsyncComponent(() => import('./forms/books-form.vue'));
const AboutForm = defineAsyncComponent(() => import('./forms/about-form.vue'));
const SettingsForm = defineAsyncComponent(() => import('./forms/settings-form.vue'));

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
