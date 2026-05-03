import { Metadata } from "next";
import { MapPin, BookOpen, Mic } from "lucide-react";
import { BookCard } from "@/components/book/book-card";
import { getBooks } from "@/lib/books";
import { getSiteSettings } from "@/lib/site-config";

export const revalidate = 300;

const AUTHOR_NAME = "Trọng Huy";
const AUTHOR_TITLE = "Tác giả • Voice Talent";
const AUTHOR_LOCATION = "Sài Gòn, Việt Nam";
const AUTHOR_FALLBACK_BIO_HTML =
  "<p>Trọng Huy là phát thanh viên radio và Voice Talent Quảng Cáo tại Việt Nam. Bên cạnh công việc giọng nói, anh còn là một người viết với những tản văn nhẹ nhàng về cuộc sống đời thường.</p>";

export const metadata: Metadata = {
  title: "Về Tác Giả",
  description: AUTHOR_FALLBACK_BIO_HTML.replace(/<[^>]+>/g, ""),
  alternates: { canonical: "/gioi-thieu" },
  openGraph: {
    title: "Về Tác Giả Trọng Huy",
    description: AUTHOR_FALLBACK_BIO_HTML.replace(/<[^>]+>/g, ""),
    type: "profile",
  },
};

export default async function AboutPage() {
  const [books, settings] = await Promise.all([getBooks(), getSiteSettings()]);
  const publishedBooks = books.filter((b) => !b.is_coming_soon);
  const bioHtml = settings.author_bio || AUTHOR_FALLBACK_BIO_HTML;

  return (
    <div className="min-h-screen">
      <section className="py-16 md:py-24 bg-primary text-white">
        <div className="container-custom text-center">
          <h1 className="font-serif text-3xl md:text-4xl font-semibold mb-6">
            Về Tác Giả
          </h1>

          <div className="w-32 h-32 md:w-40 md:h-40 rounded-full bg-white/10 border-4 border-accent/30 mx-auto mb-6 overflow-hidden">
            <div className="w-full h-full bg-gradient-to-br from-accent to-accent flex items-center justify-center">
              <span className="text-primary font-serif text-4xl font-bold">TH</span>
            </div>
          </div>

          <h2 className="font-serif text-2xl md:text-3xl font-semibold mb-2">
            {AUTHOR_NAME}
          </h2>
          <p className="text-white/70">{AUTHOR_TITLE}</p>
        </div>
      </section>

      <section className="section">
        <div className="container-custom">
          <div className="max-w-3xl mx-auto">
            <blockquote className="font-script text-2xl md:text-3xl text-gray-600 text-center mb-12">
              &ldquo;Sinh ra tại Phú Thọ, lớn lên ở Hà Nội, chọn sống ở Sài Gòn.&rdquo;
            </blockquote>

            <div className="w-24 h-1 bg-accent mx-auto rounded-full mb-12"></div>

            <div
              className="prose prose-lg prose-gray max-w-none text-gray-600 leading-relaxed"
              dangerouslySetInnerHTML={{ __html: bioHtml }}
            />

            <div className="grid md:grid-cols-3 gap-6 mt-12">
              <div className="bg-white rounded-xl p-6 border border-gray-100 text-center">
                <MapPin className="w-8 h-8 text-accent mx-auto mb-3" />
                <p className="text-sm text-gray-500">Hiện đang sống tại</p>
                <p className="font-semibold text-primary">{AUTHOR_LOCATION}</p>
              </div>
              <div className="bg-white rounded-xl p-6 border border-gray-100 text-center">
                <BookOpen className="w-8 h-8 text-accent mx-auto mb-3" />
                <p className="text-sm text-gray-500">Sách đã xuất bản</p>
                <p className="font-semibold text-primary">
                  {publishedBooks.length}+ cuốn
                </p>
              </div>
              <div className="bg-white rounded-xl p-6 border border-gray-100 text-center">
                <Mic className="w-8 h-8 text-accent mx-auto mb-3" />
                <p className="text-sm text-gray-500">Nghề nghiệp</p>
                <p className="font-semibold text-primary">Voice Talent</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container-custom">
          <h2 className="font-serif text-2xl md:text-3xl font-semibold text-primary text-center mb-12">
            Tác Phẩm
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {publishedBooks.map((book) => (
              <BookCard key={book.id} book={book} />
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
