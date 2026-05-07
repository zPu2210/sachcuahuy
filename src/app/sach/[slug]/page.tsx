import { notFound } from "next/navigation";
import Link from "next/link";
import { Metadata } from "next";
import { ChevronRight, Truck, CreditCard, Package } from "lucide-react";
import { BookCard } from "@/components/book/book-card";
import { JsonLdBook } from "@/components/seo/json-ld";
import { getBookBySlug, getBooks } from "@/lib/books";
import { buildAssetUrlFromFile } from "@/lib/directus-assets";
import type { Book } from "@/lib/types-directus";
import { formatPrice, htmlToParagraphs } from "@/lib/utils";

export const revalidate = 300;

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const books = await getBooks();
  return books
    .filter((b) => !b.is_coming_soon)
    .map((b) => ({ slug: b.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const book = await getBookBySlug(slug);

  if (!book) {
    return { title: "Không tìm thấy sách" };
  }

  const ogImage = getOgImageUrl(book) ?? "/images/book-cover-front.png";
  const title = book.seo_title || book.title;
  const description = book.seo_description || book.short_description;

  return {
    title,
    description,
    alternates: { canonical: `/sach/${book.slug}` },
    openGraph: {
      title: book.title,
      description,
      type: "article",
      url: `/sach/${book.slug}`,
      images: [{ url: ogImage, width: 1200, height: 630, alt: book.title }],
    },
    twitter: {
      card: "summary_large_image",
      title: book.title,
      description,
      images: [ogImage],
    },
  };
}

function getCoverUrl(book: Book): string | null {
  return buildAssetUrlFromFile(book.cover_image, { width: 800, format: "webp" });
}

function getOgImageUrl(book: Book): string | null {
  return buildAssetUrlFromFile(book.cover_image, {
    width: 1200,
    height: 630,
    format: "webp",
    quality: 80,
  });
}

export default async function BookDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const book = await getBookBySlug(slug);

  if (!book || book.is_coming_soon) {
    notFound();
  }

  const allBooks = await getBooks();
  const relatedBooks = allBooks.filter(
    (b) => b.id !== book.id && !b.is_coming_soon,
  );
  const isOutOfStock = book.stock_status === "out_of_stock";
  const coverUrl = getCoverUrl(book);

  return (
    <div className="min-h-screen">
      <JsonLdBook book={book} coverUrl={getOgImageUrl(book)} />
      <div className="bg-white border-b border-gray-100">
        <div className="container-custom py-4">
          <nav aria-label="Đường dẫn" className="flex items-center gap-2 text-sm text-gray-500">
            <Link href="/" className="hover:text-primary transition-colors">
              Trang chủ
            </Link>
            <ChevronRight className="w-4 h-4" aria-hidden="true" />
            <Link href="/sach" className="hover:text-primary transition-colors">
              Sách
            </Link>
            <ChevronRight className="w-4 h-4" aria-hidden="true" />
            <span className="text-primary font-medium">{book.title}</span>
          </nav>
        </div>
      </div>

      <section className="section">
        <div className="container-custom">
          <div className="grid lg:grid-cols-2 gap-12">
            <div className="space-y-4">
              <div className="aspect-[3/4] bg-primary rounded-2xl overflow-hidden shadow-book">
                {coverUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={coverUrl}
                    alt={book.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center p-12 text-white">
                    <span className="font-serif text-lg tracking-wider mb-6">
                      {book.author.toUpperCase()}
                    </span>
                    <div className="w-48 h-48 bg-white/90 rounded-[40%] flex items-center justify-center transform rotate-[-5deg]">
                      <span className="font-script text-navy text-2xl text-center leading-tight px-4">
                        {book.title}
                      </span>
                    </div>
                    {book.publisher && (
                      <span className="text-sm opacity-60 mt-auto">
                        {book.publisher.toUpperCase()}
                      </span>
                    )}
                  </div>
                )}
              </div>
            </div>

            <div>
              <h1 className="font-serif text-3xl md:text-4xl font-semibold text-primary mb-2">
                {book.title}
              </h1>
              {book.subtitle && (
                <p className="text-lg text-gray-500 italic mb-2">
                  {book.subtitle}
                </p>
              )}

              <div className="flex items-center gap-4 text-gray-500 mb-6 flex-wrap">
                <span>Tác giả: {book.author}</span>
                {book.publisher && (
                  <>
                    <span>•</span>
                    <span>{book.publisher}</span>
                  </>
                )}
              </div>

              {book.isbn && (
                <p className="text-sm text-gray-500 mb-4">ISBN: {book.isbn}</p>
              )}

              <div className="bg-secondary rounded-xl p-6 mb-6">
                <div className="flex items-baseline gap-4 flex-wrap">
                  <span className="text-3xl font-serif font-semibold text-[#7A6125]">
                    {formatPrice(book.price)}
                  </span>
                  {book.compare_price && (
                    <span className="text-lg text-gray-400 line-through">
                      {formatPrice(book.compare_price)}
                    </span>
                  )}
                </div>
              </div>

              {isOutOfStock ? (
                <p className="flex items-center gap-2 text-gray-500 mb-6">
                  <span className="w-2 h-2 bg-gray-400 rounded-full"></span>
                  Hết hàng
                </p>
              ) : (
                <p className="flex items-center gap-2 text-green-600 mb-6">
                  <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                  Còn hàng
                </p>
              )}

              <div className="flex flex-col sm:flex-row gap-4 mb-8">
                {isOutOfStock ? (
                  <button
                    type="button"
                    disabled
                    className="btn flex-1 justify-center btn-outline opacity-50 cursor-not-allowed pointer-events-none"
                  >
                    Hết hàng
                  </button>
                ) : (
                  <Link
                    href={`/dat-hang?slug=${book.slug}`}
                    className="btn btn-primary flex-1 justify-center"
                  >
                    Mua Ngay
                  </Link>
                )}
              </div>

              <div className="border-t border-gray-100 pt-6 space-y-4">
                <div className="flex items-center gap-3 text-gray-600 text-sm">
                  <Truck className="w-5 h-5 text-accent" aria-hidden="true" />
                  <span>Miễn phí ship HCM/HN, tỉnh khác 25.000đ</span>
                </div>
                <div className="flex items-center gap-3 text-gray-600 text-sm">
                  <CreditCard className="w-5 h-5 text-accent" aria-hidden="true" />
                  <span>Đặt trước qua chuyển khoản; có mã QR VietQR</span>
                </div>
                <div className="flex items-center gap-3 text-gray-600 text-sm">
                  <Package className="w-5 h-5 text-accent" aria-hidden="true" />
                  <span>Đóng gói cẩn thận</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="section bg-white">
        <div className="container-custom">
          <h2 className="font-serif text-2xl font-semibold text-primary mb-6">
            Mô Tả Sách
          </h2>
          <div className="prose prose-gray max-w-none">
            {htmlToParagraphs(book.description).map((paragraph, index) => (
              <p key={index} className="text-gray-600 leading-relaxed mb-4">
                {paragraph}
              </p>
            ))}
          </div>

          <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4">
            {book.page_count != null && (
              <div className="bg-secondary rounded-lg p-4">
                <p className="text-sm text-gray-500">Số trang</p>
                <p className="font-semibold text-primary">
                  {book.page_count} trang
                </p>
              </div>
            )}
            {book.published_date && (
              <div className="bg-secondary rounded-lg p-4">
                <p className="text-sm text-gray-500">Năm xuất bản</p>
                <p className="font-semibold text-primary">
                  {book.published_date}
                </p>
              </div>
            )}
            {book.publisher && (
              <div className="bg-secondary rounded-lg p-4">
                <p className="text-sm text-gray-500">Nhà xuất bản</p>
                <p className="font-semibold text-primary">{book.publisher}</p>
              </div>
            )}
            {book.isbn && (
              <div className="bg-secondary rounded-lg p-4">
                <p className="text-sm text-gray-500">ISBN</p>
                <p className="font-semibold text-primary text-sm">{book.isbn}</p>
              </div>
            )}
          </div>
        </div>
      </section>

      {relatedBooks.length > 0 && (
        <section className="section">
          <div className="container-custom">
            <h2 className="font-serif text-2xl font-semibold text-primary mb-8">
              Sách Khác Của Tác Giả
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {relatedBooks.slice(0, 3).map((b) => (
                <BookCard key={b.id} book={b} />
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
