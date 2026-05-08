export interface PageTab {
  id: string;
  label: string;
  icon: string;
}

export const PAGE_TABS: PageTab[] = [
  { id: 'home', label: 'Trang Chủ', icon: 'home' },
  { id: 'books', label: 'Sách', icon: 'menu_book' },
  { id: 'about', label: 'Giới Thiệu', icon: 'person' },
  { id: 'settings', label: 'Cài Đặt', icon: 'settings' },
];
