import { Metadata } from "next";
import Link from "next/link";
import { MapPin, BookOpen, Mic } from "lucide-react";
import { authorInfo, books } from "@/lib/data";
import { BookCard } from "@/components/book/book-card";

export const metadata: Metadata = {
  title: "Về Tác Giả - Sách Của Huy",
  description: authorInfo.bio,
};

export default function AboutPage() {
  const publishedBooks = books.filter((b) => !b.isComingSoon);

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="py-16 md:py-24 bg-primary text-white">
        <div className="container-custom text-center">
          <h1 className="font-serif text-3xl md:text-4xl font-semibold mb-6">
            Về Tác Giả
          </h1>

          {/* Author Photo */}
          <div className="w-32 h-32 md:w-40 md:h-40 rounded-full bg-white/10 border-4 border-accent/30 mx-auto mb-6 overflow-hidden">
            <div className="w-full h-full bg-gradient-to-br from-accent to-accent-dark flex items-center justify-center">
              <span className="text-primary font-serif text-4xl font-bold">TH</span>
            </div>
          </div>

          <h2 className="font-serif text-2xl md:text-3xl font-semibold mb-2">
            {authorInfo.name}
          </h2>
          <p className="text-white/70">{authorInfo.title}</p>
        </div>
      </section>

      {/* Bio */}
      <section className="section">
        <div className="container-custom">
          <div className="max-w-3xl mx-auto">
            <blockquote className="font-script text-2xl md:text-3xl text-gray-600 text-center mb-12">
              &ldquo;Sinh ra tại Phú Thọ, lớn lên ở Hà Nội, chọn sống ở Sài Gòn.&rdquo;
            </blockquote>

            <div className="w-24 h-1 bg-accent mx-auto rounded-full mb-12"></div>

            <div className="prose prose-lg prose-gray max-w-none">
              <p className="text-gray-600 leading-relaxed mb-6">
                Trọng Huy là phát thanh viên radio và Voice Talent Quảng Cáo tại Việt
                Nam. Bên cạnh công việc giọng nói, anh còn là một người viết với những
                tản văn nhẹ nhàng về cuộc sống đời thường.
              </p>

              <p className="text-gray-600 leading-relaxed mb-6">
                Với giọng văn thân mật, gần gũi như đang kể chuyện bên tách cà phê,
                những câu chuyện của Trọng Huy thường xoay quanh Sài Gòn, chú chó Mina,
                và những khoảnh khắc bình dị nhưng đáng nhớ trong cuộc sống.
              </p>

              <p className="text-gray-600 leading-relaxed">
                Anh tin rằng mỗi ngày đều có những điều nhỏ bé đáng được ghi lại, những
                khoảnh khắc tưởng chừng bình thường nhưng lại chứa đựng cả một bầu trời
                ký ức và cảm xúc.
              </p>
            </div>

            {/* Quick Facts */}
            <div className="grid md:grid-cols-3 gap-6 mt-12">
              <div className="bg-white rounded-xl p-6 border border-gray-100 text-center">
                <MapPin className="w-8 h-8 text-accent mx-auto mb-3" />
                <p className="text-sm text-gray-500">Hiện đang sống tại</p>
                <p className="font-semibold text-primary">{authorInfo.location}</p>
              </div>
              <div className="bg-white rounded-xl p-6 border border-gray-100 text-center">
                <BookOpen className="w-8 h-8 text-accent mx-auto mb-3" />
                <p className="text-sm text-gray-500">Sách đã xuất bản</p>
                <p className="font-semibold text-primary">{publishedBooks.length}+ cuốn</p>
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

      {/* Timeline */}
      <section className="section bg-white">
        <div className="container-custom">
          <h2 className="font-serif text-2xl md:text-3xl font-semibold text-primary text-center mb-12">
            Hành Trình
          </h2>

          <div className="max-w-3xl mx-auto">
            <div className="relative">
              {/* Timeline line */}
              <div className="absolute left-4 md:left-1/2 top-0 bottom-0 w-0.5 bg-accent/30 transform md:-translate-x-1/2"></div>

              {/* Timeline items */}
              <div className="space-y-12">
                {[
                  { year: "Sinh ra", place: "Phú Thọ", desc: "Nơi bắt đầu câu chuyện" },
                  { year: "Lớn lên", place: "Hà Nội", desc: "Những năm tháng tuổi thơ" },
                  { year: "Lập nghiệp", place: "Sài Gòn", desc: "Chọn thành phố này làm nhà" },
                  { year: "Hiện tại", place: "Viết sách", desc: "Ghi lại những câu chuyện nhỏ" },
                ].map((item, index) => (
                  <div
                    key={index}
                    className={`relative flex items-center gap-8 ${
                      index % 2 === 0 ? "md:flex-row" : "md:flex-row-reverse"
                    }`}
                  >
                    {/* Dot */}
                    <div className="absolute left-4 md:left-1/2 w-3 h-3 bg-accent rounded-full transform -translate-x-1/2 ring-4 ring-white"></div>

                    {/* Content */}
                    <div
                      className={`ml-12 md:ml-0 md:w-1/2 ${
                        index % 2 === 0 ? "md:pr-12 md:text-right" : "md:pl-12"
                      }`}
                    >
                      <span className="text-accent font-semibold">{item.year}</span>
                      <h3 className="font-serif text-xl text-primary font-semibold">
                        {item.place}
                      </h3>
                      <p className="text-gray-500">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Books */}
      <section className="section">
        <div className="container-custom">
          <h2 className="font-serif text-2xl md:text-3xl font-semibold text-primary text-center mb-12">
            Tác Phẩm
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {books.map((book) => (
              <BookCard key={book.id} book={book} />
            ))}
          </div>
        </div>
      </section>

      {/* Social Connect */}
      <section className="section bg-primary text-white">
        <div className="container-custom text-center">
          <h2 className="font-serif text-2xl md:text-3xl font-semibold mb-6">
            Kết Nối
          </h2>
          <p className="text-white/70 mb-8 max-w-xl mx-auto">
            Theo dõi Trọng Huy trên mạng xã hội để cập nhật những câu chuyện mới nhất
          </p>

          <div className="flex justify-center gap-4">
            <a
              href="#"
              className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center hover:bg-white/20 transition-colors cursor-pointer"
              aria-label="Facebook"
            >
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
              </svg>
            </a>
            <a
              href="#"
              className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center hover:bg-white/20 transition-colors cursor-pointer"
              aria-label="Instagram"
            >
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
              </svg>
            </a>
            <a
              href="#"
              className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center hover:bg-white/20 transition-colors cursor-pointer"
              aria-label="TikTok"
            >
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z" />
              </svg>
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
