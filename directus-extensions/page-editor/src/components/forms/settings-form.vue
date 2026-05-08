<template>
  <div class="settings-form">
    <h2 class="form-title">Cài Đặt</h2>
    <p class="form-desc">Cấu hình thanh toán, vận chuyển và liên hệ</p>

    <div v-if="loading" class="loading">Đang tải...</div>

    <form v-else @submit.prevent="handleSave">
      <section class="section">
        <h3 class="section-title">Thông tin chuyển khoản</h3>
        <FormField label="Ngân hàng">
          <v-input v-model="form.bank_name" placeholder="Vietcombank" />
        </FormField>
        <FormField label="Số tài khoản">
          <v-input v-model="form.bank_account" placeholder="1234567890" />
        </FormField>
        <FormField label="Chủ tài khoản">
          <v-input v-model="form.bank_holder" placeholder="NGUYEN VAN A" />
        </FormField>
        <FormField label="Chi nhánh">
          <v-input v-model="form.bank_branch" placeholder="Hồ Chí Minh" />
        </FormField>
      </section>

      <section class="section">
        <h3 class="section-title">Phí vận chuyển</h3>
        <FormField label="Thành phố miễn ship" hint="Các thành phố được miễn phí ship">
          <v-input v-model="form.shipping_free_cities" placeholder="TP.HCM, Hà Nội" />
        </FormField>
        <FormField label="Phí ship cố định (VND)">
          <v-input v-model.number="form.shipping_flat_fee" type="number" placeholder="30000" />
        </FormField>
        <FormField label="Đơn tối thiểu miễn ship (VND)" hint="Để trống nếu không áp dụng">
          <v-input v-model.number="form.shipping_threshold" type="number" placeholder="200000" />
        </FormField>
      </section>

      <section class="section">
        <h3 class="section-title">Liên hệ</h3>
        <FormField label="Email">
          <v-input v-model="form.contact_email" type="email" placeholder="contact@example.com" />
        </FormField>
        <FormField label="Số điện thoại">
          <v-input v-model="form.contact_phone" placeholder="0901234567" />
        </FormField>
      </section>

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
  bank_name: '',
  bank_account: '',
  bank_holder: '',
  bank_branch: '',
  shipping_free_cities: '',
  shipping_flat_fee: null as number | null,
  shipping_threshold: null as number | null,
  contact_email: '',
  contact_phone: '',
});

watch(settings, (s) => {
  if (s) {
    form.bank_name = s.bank_name || '';
    form.bank_account = s.bank_account || '';
    form.bank_holder = s.bank_holder || '';
    form.bank_branch = s.bank_branch || '';
    form.shipping_free_cities = s.shipping_free_cities || '';
    form.shipping_flat_fee = s.shipping_flat_fee || null;
    form.shipping_threshold = s.shipping_threshold || null;
    form.contact_email = s.contact_email || '';
    form.contact_phone = s.contact_phone || '';
  }
}, { immediate: true });

async function handleSave() {
  showSuccess.value = false;
  const success = await saveSettings({
    bank_name: form.bank_name,
    bank_account: form.bank_account,
    bank_holder: form.bank_holder,
    bank_branch: form.bank_branch,
    shipping_free_cities: form.shipping_free_cities,
    shipping_flat_fee: form.shipping_flat_fee,
    shipping_threshold: form.shipping_threshold,
    contact_email: form.contact_email,
    contact_phone: form.contact_phone,
  });
  if (success) {
    showSuccess.value = true;
    setTimeout(() => { showSuccess.value = false; }, 3000);
  }
}
</script>

<style scoped>
.settings-form { max-width: 600px; }
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
.section {
  margin-bottom: 32px;
}
.section-title {
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 16px;
  color: var(--foreground-normal);
}
.loading {
  padding: 40px;
  text-align: center;
  color: var(--foreground-subdued);
}
</style>
