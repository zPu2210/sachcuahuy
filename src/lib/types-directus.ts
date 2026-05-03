// Directus 11 collection types — mirror Phase 1 schema.
// PKs are integer auto-increment (Directus default; not UUID).

export interface DirectusFile {
  id: string;
  filename_download?: string;
  width?: number;
  height?: number;
  type?: string;
}

export type StockStatus = "in_stock" | "out_of_stock";
export type PublishStatus = "draft" | "published" | "archived";

export interface Book {
  id: number;
  status: PublishStatus;
  sort_order?: number | null;
  slug: string;
  title: string;
  subtitle?: string | null;
  author: string;
  description: string;
  short_description: string;
  price: number;
  compare_price?: number | null;
  stock_status: StockStatus;
  cover_image?: DirectusFile | string | null;
  isbn?: string | null;
  publisher?: string | null;
  published_date?: string | null;
  page_count?: number | null;
  is_new?: boolean | null;
  is_coming_soon?: boolean | null;
  seo_title?: string | null;
  seo_description?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
}

export interface SiteSettings {
  id: number;
  hero_title?: string | null;
  hero_subtitle?: string | null;
  author_bio?: string | null;
  author_short_bio?: string | null;
  author_image?: DirectusFile | string | null;
  bank_name: string;
  bank_account: string;
  bank_holder: string;
  bank_branch?: string | null;
  memo_format: string;
  shipping_free_cities: string[];
  shipping_flat_fee: number;
  shipping_threshold?: number | null;
  contact_email?: string | null;
  contact_phone?: string | null;
  social_facebook?: string | null;
  social_instagram?: string | null;
  social_zalo?: string | null;
}

export interface Page {
  id: number;
  status: PublishStatus;
  slug: string;
  title: string;
  body: string;
  meta_description?: string | null;
}

export type PaymentMethod = "cod" | "bank";
export type PaymentStatus = "pending" | "paid" | "failed" | "refunded";
export type OrderStatus =
  | "new"
  | "confirmed"
  | "shipped"
  | "delivered"
  | "cancelled";
export type NotificationStatus =
  | "pending"
  | "queued"
  | "sent"
  | "failed"
  | "retrying";

export interface OrderItem {
  book_id: number;
  slug: string;
  title: string;
  qty: number;
  price: number;
}

export interface Order {
  id: number;
  order_code: string;
  order_token: string;
  customer_id?: number | null;
  customer_name: string;
  customer_phone: string;
  customer_email?: string | null;
  shipping_city: string;
  shipping_district: string;
  shipping_address: string;
  note?: string | null;
  items: OrderItem[];
  subtotal: number;
  shipping_fee: number;
  total: number;
  payment_method: PaymentMethod;
  payment_status: PaymentStatus;
  order_status: OrderStatus;
  notification_status: NotificationStatus;
  verify_attempts: number;
  verify_locked_until?: string | null;
  verify_last_attempt_at?: string | null;
  date_created?: string;
  date_updated?: string | null;
}

export interface Customer {
  id: number;
  name: string;
  phone: string;
  email?: string | null;
}

export interface PodcastEpisode {
  id: number;
  status: PublishStatus;
  slug: string;
  title: string;
  description?: string | null;
  audio_url?: string | null;
  published_date?: string | null;
}

export interface Schema {
  books: Book[];
  orders: Order[];
  customers: Customer[];
  site_settings: SiteSettings;
  pages: Page[];
  podcast_episodes: PodcastEpisode[];
}
