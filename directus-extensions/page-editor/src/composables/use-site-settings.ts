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
    error.value = null;
    try {
      const response = await api.get('/items/site_settings');
      settings.value = response.data.data || response.data;
    } catch (e: any) {
      error.value = e.message || 'Không thể tải dữ liệu';
    } finally {
      loading.value = false;
    }
  }

  async function saveSettings(fields: Record<string, any>) {
    saving.value = true;
    error.value = null;
    try {
      await api.patch('/items/site_settings', fields);
      Object.assign(settings.value, fields);
      return true;
    } catch (e: any) {
      error.value = e.message || 'Không thể lưu';
      return false;
    } finally {
      saving.value = false;
    }
  }

  onMounted(fetchSettings);

  return { settings, loading, saving, error, fetchSettings, saveSettings };
}
