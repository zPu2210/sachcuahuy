import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";
import { PaperTexture } from "@/components/ui/paper-texture";
import type { Book } from "@/lib/types-directus";

interface CTASectionProps {
  featuredBook: Book;
}

export function CTASection({ featuredBook }: CTASectionProps) {
  return (
    <section className="relative py-24 overflow-hidden">
      <div className="absolute inset-0 watercolor-wash-sunset z-0">
        <PaperTexture className="opacity-[0.10] mix-blend-screen" />
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-accent/25 rounded-full blur-[120px] transform translate-x-1/2 -translate-y-1/2"></div>
        <div className="absolute bottom-0 left-0 w-[480px] h-[480px] bg-cobalt/30 rounded-full blur-[100px] transform -translate-x-1/3 translate-y-1/3"></div>
      </div>

      <div className="container-custom relative z-10 text-center">
        <div className="inline-flex items-center gap-2 px-4 py-1 rounded-full bg-white/10 text-white/95 text-sm font-medium mb-6 backdrop-blur-sm border border-white/20">
          <Sparkles className="w-4 h-4 text-accent-light" aria-hidden="true" />
          <span>Phiên bản giới hạn</span>
        </div>

        <h2 className="font-serif text-4xl md:text-5xl md:leading-tight font-bold text-white mb-6">
          Sở hữu cuốn sách <br className="hidden md:block" />
          <span className="text-white italic font-script font-normal">
            {featuredBook.title}
          </span>{" "}
          ngay hôm nay
        </h2>

        <p className="text-white/85 mb-10 max-w-xl mx-auto text-lg">
          Đặt hàng ngay hôm nay để nhận được ấn bản đầu tiên với{" "}
          <strong className="text-white">chữ ký tác giả</strong> và{" "}
          <strong className="text-white">bookmarks</strong> độc quyền.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            href={`/dat-hang?slug=${featuredBook.slug}`}
            className="w-full sm:w-auto btn bg-white text-primary hover:bg-accent-dark hover:text-white border-0 px-8 py-4 text-lg font-bold shadow-xl shadow-black/30 hover:shadow-2xl hover:-translate-y-0.5 transition-all"
          >
            Đặt Hàng Ngay
            <ArrowRight className="w-5 h-5 ml-2" aria-hidden="true" />
          </Link>
          <span className="text-white/70 text-sm hidden sm:inline-block">hoặc</span>
          <Link
            href="/sach"
            className="w-full sm:w-auto btn border border-white/40 text-white hover:bg-white/15 hover:border-white/60 px-8 py-4 transition-colors"
          >
            Xem Thêm Tác Phẩm
          </Link>
        </div>

        <p className="mt-8 text-white/80 text-sm">
          * Miễn phí giao hàng cho 100 đơn đầu tiên
        </p>
      </div>
    </section>
  );
}
