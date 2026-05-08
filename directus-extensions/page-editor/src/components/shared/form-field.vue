<template>
  <div class="form-field">
    <label class="field-label">{{ label }}</label>
    <slot />
    <p v-if="hint" class="field-hint">{{ hint }}</p>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  label: string;
  hint?: string;
}>();
</script>

<style scoped>
.form-field {
  margin-bottom: 20px;
}
.field-label {
  display: block;
  font-weight: 600;
  margin-bottom: 6px;
  color: var(--foreground-normal);
}
.field-hint {
  font-size: 12px;
  color: var(--foreground-subdued);
  margin-top: 4px;
}
</style>
