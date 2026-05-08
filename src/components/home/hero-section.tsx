import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";
import { formatPrice } from "@/lib/utils";
import type { Book } from "@/lib/types-directus";

interface HeroSectionProps {
  featuredBook: Book;
  title?: string | null;
  subtitle?: string | null;
}

function splitTitle(title: string) {
  const words = title.trim().split(/\s+/);
  if (words.length < 3) return { lead: title, accent: null };
  return {
    lead: words.slice(0, -2).join(" "),
    accent: words.slice(-2).join(" "),
  };
}

export function HeroSection({
  featuredBook,
  title,
  subtitle,
}: HeroSectionProps) {
  const displayTitle = title?.trim() || featuredBook.title;
  const displaySubtitle =
    subtitle?.trim() || featuredBook.subtitle || "Nơi ấy có Mina và một mái nhà";
  const titleParts = splitTitle(displayTitle);

  return (
    <section className="relative min-h-0 md:min-h-[90vh] flex flex-col md:flex-row md:items-center overflow-hidden bg-gradient-to-br from-paper via-paper to-accent/5">
      {/* Mobile: Book first, then content - tighter spacing */}
      {/* Desktop: Side by side */}

      {/* Mobile book - shows only on mobile */}
      <div className="md:hidden flex justify-center items-center pt-2 flex-[0_0_auto]">
        <div className="relative animate-float">
          <Image
            src="/images/book-floating.webp"
            alt={featuredBook.title}
            width={400}
            height={600}
            className="w-auto h-[42vh] object-contain drop-shadow-2xl"
            priority
          />
        </div>
      </div>

      {/* Content section */}
      <div className="container-custom relative z-10 py-2 md:py-16 lg:py-24 flex-1 flex items-start md:items-center">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 lg:gap-8 items-center w-full">
          {/* Text content */}
          <div className="max-w-xl text-center md:text-left">
            <span className="inline-flex items-center gap-1.5 text-accent-dark font-medium text-xs md:text-sm mb-2 md:mb-6 bg-accent/15 px-2.5 md:px-4 py-1 md:py-2 rounded-full ring-1 ring-accent/30">
              <Sparkles className="w-3 h-3 md:w-4 md:h-4 fill-accent" aria-hidden="true" />
              Tác phẩm mới ra mắt
            </span>

            <h1 className="font-serif text-2xl md:text-6xl lg:text-7xl font-bold text-primary leading-[1.15] mb-1 md:mb-6 tracking-tight">
              {titleParts.lead}
              {titleParts.accent && (
                <>
                  {" "}
                  <span className="text-accent italic relative inline md:block">
                    {titleParts.accent}
                    <svg
                      className="absolute w-full h-2 md:h-3 -bottom-0.5 md:-bottom-1 left-0 text-accent/50"
                      viewBox="0 0 100 10"
                      preserveAspectRatio="none"
                      aria-hidden="true"
                    >
                      <path
                        d="M0 5 Q 50 10 100 5"
                        stroke="currentColor"
                        strokeWidth="2"
                        fill="none"
                      />
                    </svg>
                  </span>
                </>
              )}
            </h1>

            <p className="font-sans italic text-xs md:text-2xl text-primary/70 mb-2 md:mb-6 line-clamp-2 md:line-clamp-none">
              &ldquo;{displaySubtitle}&rdquo;
            </p>

            {/* Description - desktop only */}
            <p className="hidden md:block text-gray-700 mb-10 leading-relaxed text-lg">
              {featuredBook.short_description}
            </p>

            <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 md:gap-6">
              <Link
                href={`/sach/${featuredBook.slug}`}
                className="btn btn-primary group px-5 md:px-8 py-2.5 md:py-4 text-sm md:text-lg shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-accent/30 hover:bg-primary-light hover:-translate-y-0.5 transition-all"
              >
                Đặt Hàng Ngay
                <ArrowRight
                  className="w-4 h-4 md:w-5 md:h-5 ml-1.5 group-hover:translate-x-1 transition-transform"
                  aria-hidden="true"
                />
              </Link>

              <div className="flex flex-col text-left">
                <span className="text-[10px] md:text-sm text-gray-600 font-medium uppercase tracking-wider">
                  Giá bán
                </span>
                <span className="text-lg md:text-3xl font-serif font-bold text-primary">
                  {formatPrice(featuredBook.price)}
                </span>
              </div>
            </div>
          </div>

          {/* Desktop book - hidden on mobile */}
          <div className="hidden md:flex justify-center lg:justify-end">
            <div className="relative animate-float">
              <Image
                src="/images/book-floating.webp"
                alt={featuredBook.title}
                width={600}
                height={900}
                className="w-auto h-[600px] lg:h-[750px] object-contain drop-shadow-2xl"
                priority
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
