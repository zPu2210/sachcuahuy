import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { books, formatPrice } from "@/lib/data";

export function HeroSection() {
  const featuredBook = books.find((b) => b.isNew) || books[0];

  return (
    <section className="section">
      <div className="container-custom">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          {/* Text Content */}
          <div className="order-2 md:order-1">
            <span className="inline-flex items-center gap-2 text-accent font-medium text-sm mb-4">
              <span className="w-1.5 h-1.5 bg-accent rounded-full animate-pulse"></span>
              Tác phẩm mới
            </span>

            <h1 className="font-serif text-4xl md:text-5xl lg:text-6xl font-semibold text-primary leading-tight mb-6">
              Miền Nam
              <br />
              <span className="text-accent">của Huy</span>
            </h1>

            <p className="font-script text-2xl text-gray-600 mb-4">
              &ldquo;Nơi ấy có Mina và một mái nhà&rdquo;
            </p>

            <p className="text-gray-600 mb-8 leading-relaxed">
              {featuredBook.shortDescription}
            </p>

            <div className="flex flex-wrap items-center gap-4">
              <Link href={`/sach/${featuredBook.slug}`} className="btn btn-primary">
                Đặt Hàng Ngay
                <ArrowRight className="w-5 h-5 ml-2" />
              </Link>

              <span className="text-2xl font-serif font-semibold text-accent">
                {formatPrice(featuredBook.price)}
              </span>
            </div>
          </div>

          {/* Book Image */}
          <div className="order-1 md:order-2 flex justify-center">
            <div className="relative">
              {/* Shadow/3D effect */}
              <div className="absolute inset-0 bg-primary/20 rounded-2xl transform translate-x-4 translate-y-4"></div>

              {/* Book Cover */}
              <Link
                href={`/sach/${featuredBook.slug}`}
                className="relative block bg-[#1E2B4D] rounded-2xl overflow-hidden shadow-2xl aspect-[3/4] w-64 md:w-80 transform hover:scale-105 hover:-rotate-2 transition-all duration-500 ease-out cursor-pointer"
              >
                {/* Book cover design - matching the actual cover */}
                <div className="absolute inset-0 flex flex-col items-center justify-center p-8 text-white">
                  <span className="font-serif text-sm tracking-wider mb-4">
                    TRỌNG HUY
                  </span>
                  <div className="w-32 h-32 bg-white/90 rounded-[40%] flex items-center justify-center mb-4 transform rotate-[-5deg]">
                    <span className="font-script text-navy text-xl text-center leading-tight">
                      Miền Nam
                      <br />
                      của Huy
                    </span>
                  </div>
                  <span className="text-xs opacity-60 mt-auto">NXB DÂN TRÍ</span>
                </div>

                {/* Decorative dots pattern */}
                <div className="absolute inset-0 opacity-10">
                  {Array.from({ length: 50 }).map((_, i) => (
                    <div
                      key={i}
                      className="absolute w-1 h-1 bg-white rounded-full"
                      style={{
                        left: `${Math.random() * 100}%`,
                        top: `${Math.random() * 100}%`,
                      }}
                    />
                  ))}
                </div>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
