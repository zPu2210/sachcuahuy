<template>
  <div class="books-form">
    <div class="header">
      <div>
        <h2 class="form-title">Sách</h2>
        <p class="form-desc">Quản lý danh sách sách</p>
      </div>
      <v-button @click="openCreate">+ Thêm sách mới</v-button>
    </div>

    <div v-if="loading" class="loading">Đang tải...</div>

    <div v-else-if="books.length === 0" class="empty">
      <p>Chưa có sách nào</p>
      <v-button @click="openCreate">Thêm sách đầu tiên</v-button>
    </div>

    <div v-else class="books-grid">
      <div
        v-for="book in books"
        :key="book.id"
        class="book-card"
        @click="openEdit(book)"
      >
        <div class="cover-wrapper">
          <img
            v-if="book.cover_image"
            :src="getCoverUrl(book.cover_image)"
            :alt="book.title"
            class="cover"
          />
          <div v-else class="cover-placeholder">📖</div>
        </div>
        <div class="info">
          <h3 class="book-title">{{ book.title }}</h3>
          <p class="book-price">{{ formatPrice(book.price) }}</p>
          <span :class="['status-badge', book.stock_status]">
            {{ getStockLabel(book.stock_status) }}
          </span>
          <span v-if="book.is_new" class="new-badge">Mới</span>
        </div>
      </div>
    </div>

    <!-- Edit Modal -->
    <v-drawer
      v-model="showModal"
      :title="selectedBook?.id ? 'Sửa sách' : 'Thêm sách mới'"
      @cancel="showModal = false"
    >
      <BookEditForm
        v-if="showModal"
        :book="selectedBook"
        :saving="saving"
        :error="error"
        @save="handleSave"
        @cancel="showModal = false"
      />
    </v-drawer>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useBooks, type Book } from '../../composables/use-books';
import BookEditForm from './book-edit-form.vue';

const { books, loading, saving, error, createBook, updateBook } = useBooks();
const showModal = ref(false);
const selectedBook = ref<Partial<Book> | null>(null);

const DIRECTUS_URL = 'https://cms.sachcuahuy.com';

function getCoverUrl(imageId: string) {
  return `${DIRECTUS_URL}/assets/${imageId}?width=200&height=280&fit=cover`;
}

function formatPrice(price: number) {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
  }).format(price);
}

function getStockLabel(status: string) {
  const labels: Record<string, string> = {
    in_stock: 'Còn hàng',
    out_of_stock: 'Hết hàng',
    preorder: 'Đặt trước',
  };
  return labels[status] || status;
}

function openEdit(book: Book) {
  selectedBook.value = { ...book };
  showModal.value = true;
}

function openCreate() {
  selectedBook.value = {
    title: '',
    slug: '',
    price: 0,
    stock_status: 'in_stock',
    status: 'published',
  };
  showModal.value = true;
}

async function handleSave(data: Partial<Book>) {
  let success = false;
  if (data.id) {
    success = await updateBook(data.id, data);
  } else {
    const newBook = await createBook(data);
    success = !!newBook;
  }
  if (success) {
    showModal.value = false;
  }
}
</script>

<style scoped>
.books-form { max-width: 900px; }

.header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 24px;
}

.form-title {
  font-size: 20px;
  font-weight: 600;
  margin-bottom: 4px;
  color: var(--foreground-normal);
}

.form-desc {
  color: var(--foreground-subdued);
  margin: 0;
}

.loading, .empty {
  padding: 60px;
  text-align: center;
  color: var(--foreground-subdued);
}

.empty p {
  margin-bottom: 16px;
}

.books-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  gap: 20px;
}

.book-card {
  background: var(--background-normal);
  border: 1px solid var(--border-subdued);
  border-radius: 8px;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.15s ease;
}

.book-card:hover {
  border-color: var(--primary);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.cover-wrapper {
  aspect-ratio: 5/7;
  background: var(--background-subdued);
}

.cover {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.cover-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 48px;
  opacity: 0.3;
}

.info {
  padding: 12px;
}

.book-title {
  font-size: 14px;
  font-weight: 600;
  margin-bottom: 4px;
  color: var(--foreground-normal);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.book-price {
  font-size: 13px;
  color: var(--primary);
  margin-bottom: 8px;
}

.status-badge {
  display: inline-block;
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 11px;
  font-weight: 500;
}

.status-badge.in_stock {
  background: var(--success-alt);
  color: var(--success);
}

.status-badge.out_of_stock {
  background: var(--danger-alt);
  color: var(--danger);
}

.status-badge.preorder {
  background: var(--warning-alt);
  color: var(--warning);
}

.new-badge {
  display: inline-block;
  margin-left: 6px;
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 10px;
  font-weight: 600;
  background: var(--primary);
  color: white;
}
</style>
