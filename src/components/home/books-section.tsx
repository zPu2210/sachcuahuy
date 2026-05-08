import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { BookCard } from "@/components/book/book-card";
import { HandDrawnDivider } from "@/components/ui/hand-drawn-divider";
import type { Book } from "@/lib/types-directus";

interface BooksSectionProps {
  books: Book[];
}

export function BooksSection({ books }: BooksSectionProps) {
  return (
    <section id="sach" className="section relative">
      <div className="container-custom">
        <div className="text-center mb-16 max-w-2xl mx-auto">
          <span className="text-accent-dark font-medium text-sm tracking-widest uppercase mb-3 block">
            Tủ sách
          </span>
          <h2 className="font-serif text-4xl md:text-5xl font-bold text-primary mb-6">
            Các Tác Phẩm Nổi Bật
          </h2>
          <div className="flex justify-center">
            <svg
              viewBox="0 0 200 18"
              className="w-32 h-4 text-accent"
              aria-hidden="true"
            >
              <path
                d="M4 9 C 30 2, 70 16, 100 9 C 130 2, 170 16, 196 9"
                fill="none"
                stroke="currentColor"
                strokeWidth="3"
                strokeLinecap="round"
                opacity="0.55"
              />
            </svg>
          </div>
        </div>

        {books.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-8">
            {books.map((book, index) => (
              <div key={book.id} className="h-full">
                <BookCard book={book} featured={index === 0} headingLevel={3} />
              </div>
            ))}
          </div>
        ) : (
          <p className="text-center text-gray-700">Chưa có sách nào.</p>
        )}

        <div className="mt-8 md:mt-16 flex flex-col items-center gap-6">
          <HandDrawnDivider variant="dots" className="text-accent/60" width={140} />
          <Link
            href="/sach"
            className="btn btn-outline px-8 py-3 rounded-full hover:shadow-lg hover:bg-primary hover:text-white transition-all hover:-translate-y-0.5"
          >
            Xem Tất Cả Các Sách
            <ArrowRight className="w-4 h-4 ml-2" aria-hidden="true" />
          </Link>
        </div>
      </div>
    </section>
  );
}
