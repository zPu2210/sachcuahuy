import { notFound } from "next/navigation";
import Link from "next/link";
import { Metadata } from "next";
import { ChevronRight, Truck, CreditCard, Package, Minus, Plus } from "lucide-react";
import { books, getBookBySlug, formatPrice } from "@/lib/data";
import { BookCard } from "@/components/book/book-card";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return books
    .filter((book) => !book.isComingSoon)
    .map((book) => ({
      slug: book.slug,
    }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const book = getBookBySlug(slug);

  if (!book) {
    return {
      title: "Không tìm thấy sách",
    };
  }

  return {
    title: `${book.title} - Sách Của Huy`,
    description: book.shortDescription,
    openGraph: {
      title: book.title,
      description: book.shortDescription,
      type: "website",
    },
  };
}

export default async function BookDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const book = getBookBySlug(slug);

  if (!book || book.isComingSoon) {
    notFound();
  }

  const relatedBooks = books.filter((b) => b.id !== book.id && !b.isComingSoon);

  return (
    <div className="min-h-screen">
      {/* Breadcrumb */}
      <div className="bg-white border-b border-gray-100">
        <div className="container-custom py-4">
          <nav className="flex items-center gap-2 text-sm text-gray-500">
            <Link href="/" className="hover:text-primary transition-colors">
              Trang chủ
            </Link>
            <ChevronRight className="w-4 h-4" />
            <Link href="/sach" className="hover:text-primary transition-colors">
              Sách
            </Link>
            <ChevronRight className="w-4 h-4" />
            <span className="text-primary font-medium">{book.title}</span>
          </nav>
        </div>
      </div>

      {/* Book Detail */}
      <section className="section">
        <div className="container-custom">
          <div className="grid lg:grid-cols-2 gap-12">
            {/* Image Gallery */}
            <div className="space-y-4">
              {/* Main Image */}
              <div className="aspect-[3/4] bg-primary rounded-2xl overflow-hidden shadow-book">
                <div className="w-full h-full flex flex-col items-center justify-center p-12 text-white">
                  <span className="font-serif text-lg tracking-wider mb-6">
                    TRỌNG HUY
                  </span>
                  <div className="w-48 h-48 bg-white/90 rounded-[40%] flex items-center justify-center transform rotate-[-5deg]">
                    <span className="font-script text-navy text-3xl text-center leading-tight">
                      Miền Nam
                      <br />
                      của Huy
                    </span>
                  </div>
                  <span className="text-sm opacity-60 mt-auto">NXB DÂN TRÍ</span>
                </div>
              </div>

              {/* Thumbnails - placeholder for now */}
              <div className="flex gap-4">
                {[1, 2, 3].map((i) => (
                  <button
                    key={i}
                    className="w-20 h-24 bg-primary/10 rounded-lg border-2 border-transparent hover:border-accent transition-colors cursor-pointer"
                    aria-label={`Xem ảnh ${i}`}
                  >
                    <div className="w-full h-full flex items-center justify-center">
                      <span className="font-script text-navy text-xs">Ảnh {i}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Book Info */}
            <div>
              <h1 className="font-serif text-3xl md:text-4xl font-semibold text-primary mb-2">
                {book.title}
              </h1>

              <div className="flex items-center gap-4 text-gray-500 mb-6">
                <span>Tác giả: {book.author}</span>
                <span>•</span>
                <span>{book.publisher}</span>
              </div>

              {book.isbn && (
                <p className="text-sm text-gray-500 mb-4">ISBN: {book.isbn}</p>
              )}

              {/* Price */}
              <div className="bg-secondary rounded-xl p-6 mb-6">
                <div className="flex items-baseline gap-4">
                  <span className="text-3xl font-serif font-semibold text-accent">
                    {formatPrice(book.price)}
                  </span>
                  {book.comparePrice && (
                    <span className="text-lg text-gray-400 line-through">
                      {formatPrice(book.comparePrice)}
                    </span>
                  )}
                </div>
              </div>

              {/* Stock */}
              <p className="flex items-center gap-2 text-green-600 mb-6">
                <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                Còn hàng: {book.stock.toLocaleString()} cuốn
              </p>

              {/* Quantity */}
              <div className="flex items-center gap-4 mb-6">
                <span className="text-gray-600">Số lượng:</span>
                <div className="flex items-center border border-gray-200 rounded-lg">
                  <button
                    className="p-3 text-gray-600 hover:text-primary hover:bg-gray-50 transition-colors cursor-pointer"
                    aria-label="Giảm số lượng"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="w-12 text-center font-medium">1</span>
                  <button
                    className="p-3 text-gray-600 hover:text-primary hover:bg-gray-50 transition-colors cursor-pointer"
                    aria-label="Tăng số lượng"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 mb-8">
                <button className="btn btn-outline flex-1">Thêm vào giỏ hàng</button>
                <Link href="/dat-hang" className="btn btn-primary flex-1 justify-center">
                  Mua Ngay
                </Link>
              </div>

              {/* Features */}
              <div className="border-t border-gray-100 pt-6 space-y-4">
                <div className="flex items-center gap-3 text-gray-600 text-sm">
                  <Truck className="w-5 h-5 text-accent" />
                  <span>Miễn phí ship đơn từ 300K</span>
                </div>
                <div className="flex items-center gap-3 text-gray-600 text-sm">
                  <CreditCard className="w-5 h-5 text-accent" />
                  <span>COD hoặc chuyển khoản</span>
                </div>
                <div className="flex items-center gap-3 text-gray-600 text-sm">
                  <Package className="w-5 h-5 text-accent" />
                  <span>Đóng gói cẩn thận</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Description */}
      <section className="section bg-white">
        <div className="container-custom">
          <h2 className="font-serif text-2xl font-semibold text-primary mb-6">
            Mô Tả Sách
          </h2>
          <div className="prose prose-gray max-w-none">
            {book.description.split("\n\n").map((paragraph, index) => (
              <p key={index} className="text-gray-600 leading-relaxed mb-4">
                {paragraph}
              </p>
            ))}
          </div>

          {/* Book Specs */}
          <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-secondary rounded-lg p-4">
              <p className="text-sm text-gray-500">Số trang</p>
              <p className="font-semibold text-primary">{book.pageCount} trang</p>
            </div>
            <div className="bg-secondary rounded-lg p-4">
              <p className="text-sm text-gray-500">Năm xuất bản</p>
              <p className="font-semibold text-primary">{book.publishedDate}</p>
            </div>
            <div className="bg-secondary rounded-lg p-4">
              <p className="text-sm text-gray-500">Nhà xuất bản</p>
              <p className="font-semibold text-primary">{book.publisher}</p>
            </div>
            <div className="bg-secondary rounded-lg p-4">
              <p className="text-sm text-gray-500">Loại bìa</p>
              <p className="font-semibold text-primary">Bìa cứng</p>
            </div>
          </div>
        </div>
      </section>

      {/* Related Books */}
      {relatedBooks.length > 0 && (
        <section className="section">
          <div className="container-custom">
            <h2 className="font-serif text-2xl font-semibold text-primary mb-8">
              Sách Khác Của Tác Giả
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {relatedBooks.slice(0, 3).map((relatedBook) => (
                <BookCard key={relatedBook.id} book={relatedBook} />
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
