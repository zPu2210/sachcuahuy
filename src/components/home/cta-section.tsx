import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { books, formatPrice } from "@/lib/data";

export function CTASection() {
  const featuredBook = books.find((b) => b.isNew) || books[0];

  return (
    <section className="py-16 md:py-24 bg-primary">
      <div className="max-w-4xl mx-auto px-4 md:px-8 text-center">
        <h2 className="font-serif text-3xl md:text-4xl font-semibold text-white mb-4">
          Sở hữu cuốn sách mới nhất
        </h2>
        <p className="text-white/70 mb-8 max-w-xl mx-auto">
          Đặt hàng ngay hôm nay để nhận được ấn bản đầu tiên với chữ ký tác giả
          (số lượng có hạn).
        </p>
        <Link href={`/sach/${featuredBook.slug}`} className="btn btn-secondary">
          Đặt Hàng - {formatPrice(featuredBook.price)}
          <ArrowRight className="w-5 h-5 ml-2" />
        </Link>
      </div>
    </section>
  );
}
