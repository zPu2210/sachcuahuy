"use client";

import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";
import { FadeIn } from "@/components/ui/fade-in";
import type { Book } from "@/lib/types-directus";

interface CTASectionProps {
  featuredBook: Book;
}

export function CTASection({ featuredBook }: CTASectionProps) {
  return (
    <section className="relative py-24 overflow-hidden">
      <div className="absolute inset-0 bg-[#1E2B4D] z-0">
        <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-accent/10 rounded-full blur-[120px] transform translate-x-1/2 -translate-y-1/2"></div>
      </div>

      <div className="container-custom relative z-10 text-center">
        <FadeIn>
          <div className="inline-flex items-center gap-2 px-4 py-1 rounded-full bg-white/10 text-white/90 text-sm font-medium mb-6 backdrop-blur-sm border border-white/10">
            <Sparkles className="w-4 h-4 text-accent" />
            <span>Phiên bản giới hạn</span>
          </div>
        </FadeIn>

        <FadeIn delay={0.1}>
          <h2 className="font-serif text-4xl md:text-5xl md:leading-tight font-bold text-white mb-6">
            Sở hữu cuốn sách <br className="hidden md:block" />
            <span className="text-accent">{featuredBook.title}</span> ngay hôm nay
          </h2>
        </FadeIn>

        <FadeIn delay={0.2}>
          <p className="text-white/70 mb-10 max-w-xl mx-auto text-lg">
            Đặt hàng ngay hôm nay để nhận được ấn bản đầu tiên với{" "}
            <strong className="text-white">chữ ký tác giả</strong> và{" "}
            <strong className="text-white">bookmarks</strong> độc quyền.
          </p>
        </FadeIn>

        <FadeIn delay={0.3}>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href={`/dat-hang?slug=${featuredBook.slug}`}
              className="w-full sm:w-auto btn bg-white text-primary hover:bg-accent hover:text-white border-0 px-8 py-4 text-lg font-bold shadow-xl shadow-black/20"
            >
              Đặt Hàng Ngay
              <ArrowRight className="w-5 h-5 ml-2" />
            </Link>
            <span className="text-white/50 text-sm hidden sm:inline-block">
              hoặc
            </span>
            <Link
              href="/sach"
              className="w-full sm:w-auto btn border border-white/30 text-white hover:bg-white/10 px-8 py-4"
            >
              Xem Thêm Tác Phẩm
            </Link>
          </div>

          <p className="mt-8 text-white/40 text-sm">
            * Miễn phí giao hàng cho 100 đơn đầu tiên
          </p>
        </FadeIn>
      </div>
    </section>
  );
}
