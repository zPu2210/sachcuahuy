"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { books } from "@/lib/data";
import { BookCard } from "@/components/book/book-card";
import { FadeIn } from "@/components/ui/fade-in";

export function BooksSection() {
  return (
    <section id="sach" className="section relative">
      <div className="container-custom">
        <div className="text-center mb-16 max-w-2xl mx-auto">
          <FadeIn delay={0.1}>
            <span className="text-accent font-medium text-sm tracking-widest uppercase mb-3 block">Tủ sách</span>
            <h2 className="font-serif text-4xl md:text-5xl font-bold text-primary mb-6">
              Các Tác Phẩm Nổi Bật
            </h2>
          </FadeIn>
          <FadeIn delay={0.2}>
            <div className="w-24 h-1 bg-accent/30 mx-auto rounded-full mb-6"></div>
          </FadeIn>
          {/* <FadeIn delay={0.2}>
            <p className="text-gray-500">
               Những câu chuyện được viết bằng cả trái tim, đưa bạn về những miền ký ức thân thương.
            </p>
          </FadeIn> */}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-10">
          {books.map((book, index) => (
            <FadeIn key={book.id} delay={0.1 * (index + 1)} className="h-full">
              <BookCard book={book} />
            </FadeIn>
          ))}
        </div>

        <FadeIn delay={0.6} className="text-center mt-16">
          <Link href="/sach" className="btn btn-outline px-8 py-3 rounded-full hover:shadow-lg transition-transform hover:-translate-y-1">
            Xem Tất Cả Các Sách
            <ArrowRight className="w-4 h-4 ml-2" />
          </Link>
        </FadeIn>
      </div>
    </section>
  );
}
