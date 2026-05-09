<template>
  <div class="tab-content">
    <component :is="contentComponent" />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import HomeForm from './forms/home-form.vue';
import BooksForm from './forms/books-form.vue';
import AboutForm from './forms/about-form.vue';
import SettingsForm from './forms/settings-form.vue';

const props = defineProps<{
  activeTab: string;
}>();

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
