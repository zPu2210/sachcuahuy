<template>
  <div class="home-form">
    <h2 class="form-title">Trang Chủ</h2>
    <p class="form-desc">Chỉnh sửa nội dung hiển thị trên trang chủ</p>

    <div v-if="loading" class="loading">Đang tải...</div>

    <form v-else @submit.prevent="handleSave">
      <FormField label="Tiêu đề Hero" hint="Tiêu đề lớn trên banner trang chủ">
        <v-input v-model="form.hero_title" placeholder="Miền Nam của Huy" />
      </FormField>

      <FormField label="Mô tả ngắn Hero" hint="Dòng mô tả dưới tiêu đề">
        <v-textarea
          v-model="form.hero_subtitle"
          placeholder="Hành trình đến với Miền Nam..."
          :rows="3"
        />
      </FormField>

      <FormField label="Tiểu sử ngắn" hint="Hiển thị ở mục Tác giả trên trang chủ">
        <v-textarea
          v-model="form.author_short_bio"
          placeholder="Sinh ra tại..."
          :rows="2"
        />
      </FormField>

      <FormField label="Ảnh đại diện">
        <v-form-file-image
          v-model="form.author_image"
          :folder="null"
        />
      </FormField>

      <SaveButton :loading="saving" :error="error" :success="showSuccess" />
    </form>
  </div>
</template>

<script setup lang="ts">
import { reactive, watch, ref } from 'vue';
import { useSiteSettings } from '../../composables/use-site-settings';
import FormField from '../shared/form-field.vue';
import SaveButton from '../shared/save-button.vue';

const { settings, loading, saving, error, saveSettings } = useSiteSettings();
const showSuccess = ref(false);

const form = reactive({
  hero_title: '',
  hero_subtitle: '',
  author_short_bio: '',
  author_image: null as string | null,
});

watch(settings, (s) => {
  if (s) {
    form.hero_title = s.hero_title || '';
    form.hero_subtitle = s.hero_subtitle || '';
    form.author_short_bio = s.author_short_bio || '';
    form.author_image = s.author_image || null;
  }
}, { immediate: true });

async function handleSave() {
  showSuccess.value = false;
  const success = await saveSettings({
    hero_title: form.hero_title,
    hero_subtitle: form.hero_subtitle,
    author_short_bio: form.author_short_bio,
    author_image: form.author_image,
  });
  if (success) {
    showSuccess.value = true;
    setTimeout(() => { showSuccess.value = false; }, 3000);
  }
}
</script>

<style scoped>
.home-form { max-width: 600px; }
.form-title {
  font-size: 20px;
  font-weight: 600;
  margin-bottom: 8px;
  color: var(--foreground-normal);
}
.form-desc {
  color: var(--foreground-subdued);
  margin-bottom: 24px;
}
.loading {
  padding: 40px;
  text-align: center;
  color: var(--foreground-subdued);
}
</style>
