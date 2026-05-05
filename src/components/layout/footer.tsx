import Link from "next/link";
import { Book, Mail, Phone, MapPin } from "lucide-react";
import type { SiteSettings } from "@/lib/types-directus";

interface FooterProps {
  settings: SiteSettings | null;
}

const FALLBACK_EMAIL = "hello@sachcuahuy.com";
const FALLBACK_PHONE = "0123 456 789";
const LOCATION = "TP. Hồ Chí Minh";

export function Footer({ settings }: FooterProps) {
  const email = settings ? settings.contact_email?.trim() : FALLBACK_EMAIL;
  const phone = settings ? settings.contact_phone?.trim() : FALLBACK_PHONE;
  const facebook = settings?.social_facebook;
  const instagram = settings?.social_instagram;
  const zalo = settings?.social_zalo;

  return (
    <footer className="bg-white border-t border-gray-100">
      <div className="container-custom py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="md:col-span-1">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <Book className="w-6 h-6 text-accent" />
              <span className="font-serif text-xl font-semibold text-primary">
                Sách Của Huy
              </span>
            </Link>
            <p className="text-gray-600 text-sm">
              Những câu chuyện
              <br />
              từ một góc nhìn
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h2 className="font-semibold text-primary mb-4 text-base">Liên Kết</h2>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/"
                  className="text-gray-600 text-sm hover:text-primary transition-colors"
                >
                  Trang chủ
                </Link>
              </li>
              <li>
                <Link
                  href="/sach"
                  className="text-gray-600 text-sm hover:text-primary transition-colors"
                >
                  Sách
                </Link>
              </li>
              <li>
                <Link
                  href="/podcast"
                  className="text-gray-600 text-sm hover:text-primary transition-colors"
                >
                  Podcast
                </Link>
              </li>
              <li>
                <Link
                  href="/gioi-thieu"
                  className="text-gray-600 text-sm hover:text-primary transition-colors"
                >
                  Giới thiệu
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h2 className="font-semibold text-primary mb-4 text-base">Liên Hệ</h2>
            <ul className="space-y-2">
              {email && (
                <li className="flex items-center gap-2 text-gray-600 text-sm">
                  <Mail className="w-4 h-4 flex-shrink-0" />
                  <a
                    href={`mailto:${email}`}
                    className="hover:text-primary transition-colors break-all"
                  >
                    {email}
                  </a>
                </li>
              )}
              {phone && (
                <li className="flex items-center gap-2 text-gray-600 text-sm">
                  <Phone className="w-4 h-4 flex-shrink-0" />
                  <a
                    href={`tel:${phone.replace(/\s+/g, "")}`}
                    className="hover:text-primary transition-colors"
                  >
                    {phone}
                  </a>
                </li>
              )}
              <li className="flex items-center gap-2 text-gray-600 text-sm">
                <MapPin className="w-4 h-4 flex-shrink-0" />
                <span>{LOCATION}</span>
              </li>
            </ul>
          </div>

          {/* Social */}
          <div>
            <h2 className="font-semibold text-primary mb-4 text-base">Mạng Xã Hội</h2>
            <div className="flex gap-3">
              {facebook && (
                <a
                  href={facebook}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center text-gray-600 hover:bg-primary hover:text-white transition-all"
                  aria-label="Facebook"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                  </svg>
                </a>
              )}
              {instagram && (
                <a
                  href={instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center text-gray-600 hover:bg-primary hover:text-white transition-all"
                  aria-label="Instagram"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                  </svg>
                </a>
              )}
              {zalo && (
                <a
                  href={zalo}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center text-gray-600 hover:bg-primary hover:text-white transition-all text-xs font-bold"
                  aria-label="Zalo"
                >
                  Zalo
                </a>
              )}
              {!facebook && !instagram && !zalo && (
                <span className="text-sm text-gray-400">Sẽ cập nhật sau.</span>
              )}
            </div>
          </div>
        </div>

        {/* Bottom */}
        <div className="border-t border-gray-100 mt-12 pt-8">
          <p className="text-center text-gray-500 text-sm">
            © 2026 Sách Của Huy. Bảo lưu mọi quyền.
          </p>
        </div>
      </div>
    </footer>
  );
}
