import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { books } from "@/lib/data";
import { BookCard } from "@/components/book/book-card";

export function BooksSection() {
  return (
    <section id="sach" className="section">
      <div className="container-custom">
        <div className="text-center mb-12">
          <h2 className="font-serif text-3xl md:text-4xl font-semibold text-primary mb-4">
            Các Tác Phẩm
          </h2>
          <div className="w-24 h-1 bg-accent mx-auto rounded-full"></div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {books.map((book) => (
            <BookCard key={book.id} book={book} />
          ))}
        </div>

        <div className="text-center mt-12">
          <Link href="/sach" className="btn btn-outline">
            Xem Tất Cả Sách
            <ArrowRight className="w-5 h-5 ml-2" />
          </Link>
        </div>
      </div>
    </section>
  );
}
