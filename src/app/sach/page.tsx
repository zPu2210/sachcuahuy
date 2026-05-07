import { Metadata } from "next";
import Link from "next/link";
import { ChevronRight, BookOpen } from "lucide-react";
import { BookCard } from "@/components/book/book-card";
import { HandDrawnDivider } from "@/components/ui/hand-drawn-divider";
import { PaperTexture } from "@/components/ui/paper-texture";
import { WatercolorWash } from "@/components/ui/watercolor-wash";
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
          <nav aria-label="Đường dẫn" className="flex items-center gap-2 text-sm text-gray-500">
            <Link href="/" className="hover:text-primary transition-colors">
              Trang chủ
            </Link>
            <ChevronRight className="w-4 h-4" aria-hidden="true" />
            <span className="text-primary font-medium">Sách</span>
          </nav>
        </div>
      </div>

      <section className="relative py-14 md:py-20 bg-paper overflow-hidden">
        <PaperTexture />
        <WatercolorWash
          color="terracotta"
          className="top-[-20%] left-[-10%] w-[420px] h-[420px] rounded-full opacity-40"
        />
        <WatercolorWash
          color="cobalt"
          className="bottom-[-25%] right-[-10%] w-[460px] h-[460px] rounded-full opacity-40"
        />
        <div className="container-custom relative z-10 text-center">
          <span className="text-accent-dark font-medium text-sm tracking-widest uppercase mb-3 block">
            Tủ sách
          </span>
          <h1 className="font-serif text-3xl md:text-5xl font-semibold text-primary mb-5">
            Tất Cả Sách
          </h1>
          <div className="flex justify-center mb-5">
            <HandDrawnDivider variant="wave" className="text-accent/70" width={140} />
          </div>
          <p className="text-gray-700 max-w-xl mx-auto leading-relaxed">
            Những câu chuyện nhỏ được kể với giọng văn nhẹ nhàng, đầy hoài niệm.
          </p>
        </div>
      </section>

      <section className="section">
        <div className="container-custom">
          {books.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {books.map((book, index) => (
                <BookCard key={book.id} book={book} featured={index === 0} />
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <span
                aria-hidden="true"
                className="inline-flex w-16 h-16 rounded-full bg-accent/10 ring-1 ring-accent/30 items-center justify-center mb-4"
              >
                <BookOpen className="w-7 h-7 text-accent-dark" />
              </span>
              <p className="text-gray-700">Chưa có sách nào.</p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
