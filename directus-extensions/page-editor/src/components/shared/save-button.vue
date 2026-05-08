<template>
  <div class="save-area">
    <p v-if="error" class="error">{{ error }}</p>
    <p v-if="success" class="success">✓ Đã lưu thành công!</p>
    <v-button type="submit" :loading="loading" :disabled="loading">
      💾 Lưu thay đổi
    </v-button>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  loading: boolean;
  error: string | null;
  success?: boolean;
}>();
</script>

<style scoped>
.save-area {
  margin-top: 32px;
  padding-top: 24px;
  border-top: 1px solid var(--border-subdued);
}
.error {
  color: var(--danger);
  margin-bottom: 12px;
}
.success {
  color: var(--success);
  margin-bottom: 12px;
}
</style>
