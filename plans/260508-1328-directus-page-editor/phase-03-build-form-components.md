---
phase: 3
title: "Build Form Components"
status: pending
priority: P1
effort: "4h"
dependencies: [2]
---

# Phase 3: Build Form Components

## Overview

Build the 4 form components that let Huy edit content. Each form fetches data from Directus API, displays editable fields with Vietnamese labels, and saves changes. Reference: `docs/content-map.md` for field mappings.

## Requirements

### Functional
- **HomeForm**: hero_title, hero_subtitle, author_short_bio, author_image
- **AboutForm**: author_bio (rich text), social links
- **BooksForm**: List view + edit modal for all book fields
- **SettingsForm**: Bank info, shipping config, contact

### Non-functional
- Use Directus's built-in form components (v-input, v-textarea, etc.)
- Show loading states
- Toast notifications on save success/error
- Validate required fields

## Architecture

```
Forms use Directus useApi() composable:
┌─────────────────────────────────────────────┐
│ HomeForm.vue                                │
│  ├── useApi() → GET /items/site_settings   │
│  ├── v-input (hero_title)                  │
│  ├── v-textarea (hero_subtitle)            │
│  ├── v-input (author_short_bio)            │
│  ├── FileUpload (author_image)             │
│  └── SaveButton → PATCH /items/site_settings│
└─────────────────────────────────────────────┘
```

## Related Code Files

### Create
- `src/components/forms/HomeForm.vue`
- `src/components/forms/AboutForm.vue`
- `src/components/forms/BooksForm.vue`
- `src/components/forms/SettingsForm.vue`
- `src/components/shared/FormField.vue`
- `src/components/shared/SaveButton.vue`
- `src/composables/useSiteSettings.ts`
- `src/composables/useBooks.ts`

## Implementation Steps

### 1. Create useSiteSettings composable

```typescript
// src/composables/useSiteSettings.ts
import { ref, onMounted } from 'vue';
import { useApi } from '@directus/extensions-sdk';

export function useSiteSettings() {
  const api = useApi();
  const settings = ref<Record<string, any>>({});
  const loading = ref(true);
  const saving = ref(false);
  const error = ref<string | null>(null);

  async function fetchSettings() {
    loading.value = true;
    try {
      const response = await api.get('/items/site_settings');
      settings.value = response.data.data;
    } catch (e: any) {
      error.value = e.message;
    } finally {
      loading.value = false;
    }
  }

  async function saveSettings(fields: Record<string, any>) {
    saving.value = true;
    error.value = null;
    try {
      // site_settings is singleton, update the single record
      await api.patch('/items/site_settings', fields);
      Object.assign(settings.value, fields);
      return true;
    } catch (e: any) {
      error.value = e.message;
      return false;
    } finally {
      saving.value = false;
    }
  }

  onMounted(fetchSettings);

  return { settings, loading, saving, error, fetchSettings, saveSettings };
}
```

### 2. Create FormField wrapper

```vue
<!-- src/components/shared/FormField.vue -->
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
```

### 3. Build HomeForm

```vue
<!-- src/components/forms/HomeForm.vue -->
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

      <FormField label="Tiểu sử ngắn" hint="Hiển thị ở mục Tác giả">
        <v-textarea
          v-model="form.author_short_bio"
          placeholder="Sinh ra tại..."
          :rows="2"
        />
      </FormField>

      <FormField label="Ảnh đại diện">
        <v-file-input
          v-model="form.author_image"
          :accept="['image/*']"
        />
      </FormField>

      <SaveButton :loading="saving" :error="error" />
    </form>
  </div>
</template>

<script setup lang="ts">
import { reactive, watch } from 'vue';
import { useSiteSettings } from '../../composables/useSiteSettings';
import FormField from '../shared/FormField.vue';
import SaveButton from '../shared/SaveButton.vue';

const { settings, loading, saving, error, saveSettings } = useSiteSettings();

const form = reactive({
  hero_title: '',
  hero_subtitle: '',
  author_short_bio: '',
  author_image: null as string | null,
});

watch(settings, (s) => {
  form.hero_title = s.hero_title || '';
  form.hero_subtitle = s.hero_subtitle || '';
  form.author_short_bio = s.author_short_bio || '';
  form.author_image = s.author_image || null;
}, { immediate: true });

async function handleSave() {
  const success = await saveSettings({
    hero_title: form.hero_title,
    hero_subtitle: form.hero_subtitle,
    author_short_bio: form.author_short_bio,
    author_image: form.author_image,
  });
  if (success) {
    // Show toast - use Directus notification system
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
```

### 4. Build AboutForm (similar pattern)

```vue
<!-- src/components/forms/AboutForm.vue -->
<template>
  <div class="about-form">
    <h2 class="form-title">Giới Thiệu</h2>
    <p class="form-desc">Thông tin tác giả hiển thị trên trang /gioi-thieu</p>

    <div v-if="loading" class="loading">Đang tải...</div>

    <form v-else @submit.prevent="handleSave">
      <FormField label="Tiểu sử chi tiết (HTML)" hint="Nội dung đầy đủ về tác giả">
        <v-wysiwyg v-model="form.author_bio" />
      </FormField>

      <FormField label="Facebook" hint="Link trang Facebook">
        <v-input v-model="form.social_facebook" placeholder="https://facebook.com/..." />
      </FormField>

      <FormField label="Instagram">
        <v-input v-model="form.social_instagram" placeholder="https://instagram.com/..." />
      </FormField>

      <FormField label="Zalo" hint="Link hoặc số điện thoại Zalo">
        <v-input v-model="form.social_zalo" placeholder="https://zalo.me/..." />
      </FormField>

      <SaveButton :loading="saving" :error="error" />
    </form>
  </div>
</template>

<script setup lang="ts">
// Similar to HomeForm with author_bio, social_* fields
</script>
```

### 5. Build BooksForm (list + edit)

```vue
<!-- src/components/forms/BooksForm.vue -->
<template>
  <div class="books-form">
    <div class="header">
      <h2 class="form-title">Sách</h2>
      <v-button @click="openCreate">+ Thêm sách mới</v-button>
    </div>

    <div v-if="loading" class="loading">Đang tải...</div>

    <div v-else class="books-grid">
      <div v-for="book in books" :key="book.id" class="book-card" @click="openEdit(book)">
        <img :src="getCoverUrl(book.cover_image)" :alt="book.title" class="cover" />
        <div class="info">
          <h3>{{ book.title }}</h3>
          <p class="price">{{ formatPrice(book.price) }}</p>
          <span :class="['status', book.stock_status]">
            {{ book.stock_status === 'in_stock' ? 'Còn hàng' : 'Hết hàng' }}
          </span>
        </div>
      </div>
    </div>

    <!-- Edit Modal -->
    <v-dialog v-model="showModal">
      <BookEditForm
        v-if="selectedBook"
        :book="selectedBook"
        @save="handleSave"
        @close="showModal = false"
      />
    </v-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useBooks } from '../../composables/useBooks';
import BookEditForm from './BookEditForm.vue';

const { books, loading, createBook, updateBook } = useBooks();
const showModal = ref(false);
const selectedBook = ref(null);

function openEdit(book: any) {
  selectedBook.value = book;
  showModal.value = true;
}

function openCreate() {
  selectedBook.value = { id: null }; // New book
  showModal.value = true;
}

async function handleSave(data: any) {
  if (data.id) {
    await updateBook(data.id, data);
  } else {
    await createBook(data);
  }
  showModal.value = false;
}
</script>
```

### 6. Build SettingsForm

```vue
<!-- src/components/forms/SettingsForm.vue -->
<template>
  <div class="settings-form">
    <h2 class="form-title">Cài Đặt</h2>

    <section class="section">
      <h3>Thông tin chuyển khoản</h3>
      <FormField label="Ngân hàng">
        <v-input v-model="form.bank_name" placeholder="VCB" />
      </FormField>
      <FormField label="Số tài khoản">
        <v-input v-model="form.bank_account" />
      </FormField>
      <FormField label="Chủ tài khoản">
        <v-input v-model="form.bank_holder" />
      </FormField>
      <FormField label="Chi nhánh">
        <v-input v-model="form.bank_branch" />
      </FormField>
    </section>

    <section class="section">
      <h3>Phí vận chuyển</h3>
      <FormField label="Phí ship cố định (VND)">
        <v-input v-model.number="form.shipping_flat_fee" type="number" />
      </FormField>
      <FormField label="Đơn tối thiểu miễn ship (VND)" hint="Để trống nếu không áp dụng">
        <v-input v-model.number="form.shipping_threshold" type="number" />
      </FormField>
    </section>

    <section class="section">
      <h3>Liên hệ</h3>
      <FormField label="Email">
        <v-input v-model="form.contact_email" type="email" />
      </FormField>
      <FormField label="Số điện thoại">
        <v-input v-model="form.contact_phone" />
      </FormField>
    </section>

    <SaveButton :loading="saving" :error="error" />
  </div>
</template>
```

### 7. Create SaveButton component

```vue
<!-- src/components/shared/SaveButton.vue -->
<template>
  <div class="save-area">
    <p v-if="error" class="error">{{ error }}</p>
    <v-button type="submit" :loading="loading" :disabled="loading">
      💾 Lưu thay đổi
    </v-button>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  loading: boolean;
  error: string | null;
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
</style>
```

## Success Criteria

- [ ] HomeForm: can edit hero_title, hero_subtitle and save
- [ ] AboutForm: can edit author_bio (rich text) and social links
- [ ] BooksForm: can view book list, click to edit, save changes
- [ ] BooksForm: can add new book with cover image
- [ ] SettingsForm: can edit bank info and shipping config
- [ ] All forms show loading state while fetching
- [ ] All forms show success toast on save
- [ ] All forms show error message on failure

## Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| v-wysiwyg not available | Medium | High | Fall back to v-textarea; check Directus 11 component docs |

<!-- Updated: Validation Session 1 - Confirmed use Directus WYSIWYG for author_bio -->
| File upload API differs | Medium | Medium | Test with Directus /files endpoint |
| Books CRUD needs permissions | Low | Medium | Use existing editor role token |
