<template>
  <div class="book-edit-form">
    <form @submit.prevent="handleSubmit">
      <div class="form-content">
        <FormField label="Tên sách *">
          <v-input v-model="form.title" placeholder="Tên sách" required />
        </FormField>

        <FormField label="Slug (URL)" hint="Tự động tạo từ tên nếu để trống">
          <v-input v-model="form.slug" placeholder="ten-sach" />
        </FormField>

        <FormField label="Phụ đề">
          <v-input v-model="form.subtitle" placeholder="Phụ đề sách" />
        </FormField>

        <FormField label="Tác giả">
          <v-input v-model="form.author" placeholder="Tên tác giả" />
        </FormField>

        <div class="row">
          <FormField label="Giá bán (VND) *">
            <v-input v-model.number="form.price" type="number" required />
          </FormField>
          <FormField label="Giá gốc (nếu giảm giá)">
            <v-input v-model.number="form.compare_price" type="number" />
          </FormField>
        </div>

        <FormField label="Trạng thái kho">
          <v-select
            v-model="form.stock_status"
            :items="stockOptions"
          />
        </FormField>

        <FormField label="Mô tả ngắn">
          <v-textarea v-model="form.short_description" :rows="2" />
        </FormField>

        <FormField label="Mô tả chi tiết">
          <v-textarea v-model="form.description" :rows="5" />
        </FormField>

        <FormField label="Ảnh bìa">
          <v-form-file-image v-model="form.cover_image" :folder="null" />
        </FormField>

        <div class="row">
          <FormField label="ISBN">
            <v-input v-model="form.isbn" />
          </FormField>
          <FormField label="NXB">
            <v-input v-model="form.publisher" />
          </FormField>
        </div>

        <div class="row">
          <FormField label="Ngày xuất bản">
            <v-input v-model="form.published_date" type="date" />
          </FormField>
          <FormField label="Số trang">
            <v-input v-model.number="form.page_count" type="number" />
          </FormField>
        </div>

        <div class="checkboxes">
          <v-checkbox v-model="form.is_new" label="Sách mới (hiện badge)" />
          <v-checkbox v-model="form.is_coming_soon" label="Sắp ra mắt" />
        </div>

        <h4 class="section-title">SEO</h4>
        <FormField label="Tiêu đề SEO">
          <v-input v-model="form.seo_title" placeholder="Tự động dùng tên sách nếu trống" />
        </FormField>
        <FormField label="Mô tả SEO">
          <v-textarea v-model="form.seo_description" :rows="2" />
        </FormField>
      </div>

      <div class="form-actions">
        <p v-if="error" class="error">{{ error }}</p>
        <div class="buttons">
          <v-button secondary @click="$emit('cancel')">Huỷ</v-button>
          <v-button type="submit" :loading="saving">
            💾 {{ book?.id ? 'Cập nhật' : 'Tạo sách' }}
          </v-button>
        </div>
      </div>
    </form>
  </div>
</template>

<script setup lang="ts">
import { reactive, watch } from 'vue';
import type { Book } from '../../composables/use-books';
import FormField from '../shared/form-field.vue';

const props = defineProps<{
  book: Partial<Book> | null;
  saving: boolean;
  error: string | null;
}>();

const emit = defineEmits<{
  save: [data: Partial<Book>];
  cancel: [];
}>();

const stockOptions = [
  { text: 'Còn hàng', value: 'in_stock' },
  { text: 'Hết hàng', value: 'out_of_stock' },
  { text: 'Đặt trước', value: 'preorder' },
];

const form = reactive<Partial<Book>>({
  title: '',
  slug: '',
  subtitle: '',
  author: '',
  price: 0,
  compare_price: undefined,
  stock_status: 'in_stock',
  short_description: '',
  description: '',
  cover_image: undefined,
  isbn: '',
  publisher: '',
  published_date: '',
  page_count: undefined,
  is_new: false,
  is_coming_soon: false,
  seo_title: '',
  seo_description: '',
});

watch(() => props.book, (book) => {
  if (book) {
    Object.assign(form, {
      id: book.id,
      title: book.title || '',
      slug: book.slug || '',
      subtitle: book.subtitle || '',
      author: book.author || '',
      price: book.price || 0,
      compare_price: book.compare_price,
      stock_status: book.stock_status || 'in_stock',
      short_description: book.short_description || '',
      description: book.description || '',
      cover_image: book.cover_image,
      isbn: book.isbn || '',
      publisher: book.publisher || '',
      published_date: book.published_date || '',
      page_count: book.page_count,
      is_new: book.is_new || false,
      is_coming_soon: book.is_coming_soon || false,
      seo_title: book.seo_title || '',
      seo_description: book.seo_description || '',
    });
  }
}, { immediate: true });

function generateSlug(title: string) {
  return title
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/đ/g, 'd')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

function handleSubmit() {
  const data = { ...form };
  if (!data.slug && data.title) {
    data.slug = generateSlug(data.title);
  }
  emit('save', data);
}
</script>

<style scoped>
.book-edit-form {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.form-content {
  flex: 1;
  padding: 24px;
  overflow-y: auto;
}

.row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}

.checkboxes {
  display: flex;
  gap: 24px;
  margin: 16px 0;
}

.section-title {
  font-size: 14px;
  font-weight: 600;
  margin: 24px 0 12px;
  padding-top: 16px;
  border-top: 1px solid var(--border-subdued);
  color: var(--foreground-normal);
}

.form-actions {
  padding: 16px 24px;
  border-top: 1px solid var(--border-subdued);
  background: var(--background-normal);
}

.error {
  color: var(--danger);
  margin-bottom: 12px;
}

.buttons {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}
</style>
