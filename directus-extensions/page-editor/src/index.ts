import { defineModule } from '@directus/extensions-sdk';
import ModuleComponent from './module.vue';

export default defineModule({
  id: 'page-editor',
  name: 'Quản Lý Nội Dung',
  icon: 'edit_note',
  routes: [
    {
      path: '',
      component: ModuleComponent,
    },
  ],
});
