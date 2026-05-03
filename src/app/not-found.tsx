import type { Metadata } from "next";
import Link from "next/link";
import { Home, Book, ArrowLeft } from "lucide-react";

export const metadata: Metadata = {
  title: "Không tìm thấy trang",
  description: "Trang bạn đang tìm kiếm không tồn tại.",
  robots: { index: false, follow: false },
};

export default function NotFound() {
  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-24 bg-cream">
      <div className="text-center max-w-md mx-auto">
        <h1
          aria-hidden="true"
          className="font-serif text-7xl md:text-9xl font-bold text-primary/10 mb-2 leading-none select-none"
        >
          404
        </h1>
        <h2 className="font-serif text-2xl md:text-3xl font-semibold text-primary mb-4">
          Không tìm thấy trang
        </h2>
        <p className="text-gray-600 mb-8">
          Trang bạn đang tìm kiếm không tồn tại hoặc đã được di chuyển. Hãy
          quay lại trang chủ hoặc khám phá các tác phẩm.
        </p>
        <div className="flex flex-wrap justify-center gap-3">
          <Link
            href="/"
            className="btn btn-primary inline-flex items-center px-6 py-3"
          >
            <Home className="w-5 h-5 mr-2" />
            Trang chủ
          </Link>
          <Link
            href="/sach"
            className="btn btn-outline inline-flex items-center px-6 py-3"
          >
            <Book className="w-5 h-5 mr-2" />
            Xem sách
          </Link>
        </div>
        <Link
          href="/gioi-thieu"
          className="mt-8 inline-flex items-center text-sm text-gray-500 hover:text-primary transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-1" />
          Về tác giả
        </Link>
      </div>
    </div>
  );
}
