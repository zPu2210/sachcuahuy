import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { BookCard } from "@/components/book/book-card";
import type { Book } from "@/lib/types-directus";

interface BooksSectionProps {
  books: Book[];
}

export function BooksSection({ books }: BooksSectionProps) {
  return (
    <section id="sach" className="section relative">
      <div className="container-custom">
        <div className="text-center mb-16 max-w-2xl mx-auto">
          <div>
            <span className="text-[#7A6125] font-medium text-sm tracking-widest uppercase mb-3 block">
              Tủ sách
            </span>
            <h2 className="font-serif text-4xl md:text-5xl font-bold text-primary mb-6">
              Các Tác Phẩm Nổi Bật
            </h2>
          </div>
          <div>
            <div className="w-24 h-1 bg-accent/30 mx-auto rounded-full mb-6"></div>
          </div>
        </div>

        {books.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-10">
            {books.map((book, index) => (
              <div
                key={book.id}
                className="h-full"
              >
                <BookCard book={book} featured={index === 0} />
              </div>
            ))}
          </div>
        ) : (
          <p className="text-center text-gray-500">Chưa có sách nào.</p>
        )}

        <div className="text-center mt-16">
          <Link
            href="/sach"
            className="btn btn-outline px-8 py-3 rounded-full hover:shadow-lg transition-transform hover:-translate-y-1"
          >
            Xem Tất Cả Các Sách
            <ArrowRight className="w-4 h-4 ml-2" />
          </Link>
        </div>
      </div>
    </section>
  );
}
