import { Metadata } from "next";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { BookCard } from "@/components/book/book-card";
import { getBooks } from "@/lib/books";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "Tất Cả Sách",
  description: "Danh sách các tác phẩm văn học của Trọng Huy",
  alternates: { canonical: "/sach" },
  openGraph: {
    title: "Tất Cả Sách",
    description: "Danh sách các tác phẩm văn học của Trọng Huy",
    type: "website",
  },
};

export default async function BooksPage() {
  const books = await getBooks();

  return (
    <div className="min-h-screen">
      <div className="bg-white border-b border-gray-100">
        <div className="container-custom py-4">
          <nav className="flex items-center gap-2 text-sm text-gray-500">
            <Link href="/" className="hover:text-primary transition-colors">
              Trang chủ
            </Link>
            <ChevronRight className="w-4 h-4" />
            <span className="text-primary font-medium">Sách</span>
          </nav>
        </div>
      </div>

      <section className="py-12 md:py-16 bg-white">
        <div className="container-custom text-center">
          <h1 className="font-serif text-3xl md:text-4xl font-semibold text-primary mb-4">
            Tất Cả Sách
          </h1>
          <p className="text-gray-600 max-w-xl mx-auto">
            Khám phá các tác phẩm văn học của Trọng Huy — những câu chuyện nhỏ
            được kể với giọng văn nhẹ nhàng, đầy hoài niệm.
          </p>
        </div>
      </section>

      <section className="section">
        <div className="container-custom">
          {books.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {books.map((book) => (
                <BookCard key={book.id} book={book} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-500">Chưa có sách nào.</p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
