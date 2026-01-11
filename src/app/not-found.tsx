import Link from "next/link";
import { Home, Book } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="text-center">
        <h1 className="font-serif text-6xl md:text-8xl font-bold text-primary/10 mb-4">
          404
        </h1>
        <h2 className="font-serif text-2xl md:text-3xl font-semibold text-primary mb-4">
          Không tìm thấy trang
        </h2>
        <p className="text-gray-600 mb-8 max-w-md mx-auto">
          Trang bạn đang tìm kiếm không tồn tại hoặc đã được di chuyển.
        </p>
        <div className="flex flex-wrap justify-center gap-4">
          <Link href="/" className="btn btn-primary">
            <Home className="w-5 h-5 mr-2" />
            Trang chủ
          </Link>
          <Link href="/sach" className="btn btn-outline">
            <Book className="w-5 h-5 mr-2" />
            Xem sách
          </Link>
        </div>
      </div>
    </div>
  );
}
