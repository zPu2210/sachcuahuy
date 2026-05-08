<template>
  <div class="about-form">
    <h2 class="form-title">Giới Thiệu</h2>
    <p class="form-desc">Thông tin tác giả hiển thị trên trang /gioi-thieu</p>

    <div v-if="loading" class="loading">Đang tải...</div>

    <form v-else @submit.prevent="handleSave">
      <FormField label="Tiểu sử chi tiết" hint="Nội dung đầy đủ về tác giả (hỗ trợ HTML)">
        <v-textarea
          v-model="form.author_bio"
          :rows="8"
          placeholder="Viết tiểu sử chi tiết..."
        />
      </FormField>

      <FormField label="Tiểu sử ngắn" hint="Trích dẫn ngắn hiển thị ở đầu trang">
        <v-textarea
          v-model="form.author_short_bio"
          :rows="2"
          placeholder="Một câu về tác giả..."
        />
      </FormField>

      <FormField label="Ảnh đại diện">
        <v-form-file-image
          v-model="form.author_image"
          :folder="null"
        />
      </FormField>

      <h3 class="section-title">Mạng xã hội</h3>

      <FormField label="Facebook" hint="Link trang Facebook">
        <v-input v-model="form.social_facebook" placeholder="https://facebook.com/..." />
      </FormField>

      <FormField label="Instagram">
        <v-input v-model="form.social_instagram" placeholder="https://instagram.com/..." />
      </FormField>

      <FormField label="Zalo" hint="Link hoặc số điện thoại Zalo">
        <v-input v-model="form.social_zalo" placeholder="https://zalo.me/..." />
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
  author_bio: '',
  author_short_bio: '',
  author_image: null as string | null,
  social_facebook: '',
  social_instagram: '',
  social_zalo: '',
});

watch(settings, (s) => {
  if (s) {
    form.author_bio = s.author_bio || '';
    form.author_short_bio = s.author_short_bio || '';
    form.author_image = s.author_image || null;
    form.social_facebook = s.social_facebook || '';
    form.social_instagram = s.social_instagram || '';
    form.social_zalo = s.social_zalo || '';
  }
}, { immediate: true });

async function handleSave() {
  showSuccess.value = false;
  const success = await saveSettings({
    author_bio: form.author_bio,
    author_short_bio: form.author_short_bio,
    author_image: form.author_image,
    social_facebook: form.social_facebook,
    social_instagram: form.social_instagram,
    social_zalo: form.social_zalo,
  });
  if (success) {
    showSuccess.value = true;
    setTimeout(() => { showSuccess.value = false; }, 3000);
  }
}
</script>

<style scoped>
.about-form { max-width: 600px; }
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
.section-title {
  font-size: 16px;
  font-weight: 600;
  margin: 32px 0 16px;
  padding-top: 16px;
  border-top: 1px solid var(--border-subdued);
  color: var(--foreground-normal);
}
.loading {
  padding: 40px;
  text-align: center;
  color: var(--foreground-subdued);
}
</style>
