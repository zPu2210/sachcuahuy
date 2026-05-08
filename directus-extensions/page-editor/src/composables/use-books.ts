import { ref, onMounted } from 'vue';
import { useApi } from '@directus/extensions-sdk';

export interface Book {
  id: number;
  title: string;
  subtitle?: string;
  author?: string;
  slug: string;
  description?: string;
  short_description?: string;
  price: number;
  compare_price?: number;
  stock_status: 'in_stock' | 'out_of_stock' | 'preorder';
  cover_image?: string;
  gallery?: string[];
  isbn?: string;
  publisher?: string;
  published_date?: string;
  page_count?: number;
  is_new?: boolean;
  is_coming_soon?: boolean;
  seo_title?: string;
  seo_description?: string;
  status: string;
}

export function useBooks() {
  const api = useApi();
  const books = ref<Book[]>([]);
  const loading = ref(true);
  const saving = ref(false);
  const error = ref<string | null>(null);

  async function fetchBooks() {
    loading.value = true;
    error.value = null;
    try {
      const response = await api.get('/items/books', {
        params: { sort: '-date_created', limit: -1 }
      });
      books.value = response.data.data || response.data;
    } catch (e: any) {
      error.value = e.message || 'Không thể tải sách';
    } finally {
      loading.value = false;
    }
  }

  async function createBook(data: Partial<Book>) {
    saving.value = true;
    error.value = null;
    try {
      const response = await api.post('/items/books', data);
      const newBook = response.data.data || response.data;
      books.value.unshift(newBook);
      return newBook;
    } catch (e: any) {
      error.value = e.message || 'Không thể tạo sách';
      return null;
    } finally {
      saving.value = false;
    }
  }

  async function updateBook(id: number, data: Partial<Book>) {
    saving.value = true;
    error.value = null;
    try {
      await api.patch(`/items/books/${id}`, data);
      const idx = books.value.findIndex(b => b.id === id);
      if (idx !== -1) {
        books.value[idx] = { ...books.value[idx], ...data };
      }
      return true;
    } catch (e: any) {
      error.value = e.message || 'Không thể cập nhật sách';
      return false;
    } finally {
      saving.value = false;
    }
  }

  async function deleteBook(id: number) {
    saving.value = true;
    error.value = null;
    try {
      await api.delete(`/items/books/${id}`);
      books.value = books.value.filter(b => b.id !== id);
      return true;
    } catch (e: any) {
      error.value = e.message || 'Không thể xoá sách';
      return false;
    } finally {
      saving.value = false;
    }
  }

  onMounted(fetchBooks);

  return { books, loading, saving, error, fetchBooks, createBook, updateBook, deleteBook };
}
