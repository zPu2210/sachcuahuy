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
    <section className="relative min-h-[90vh] flex items-center overflow-hidden bg-paper">
      {/* Watercolor hero banner */}
      <picture className="absolute inset-0 pointer-events-none">
        <source media="(max-width: 768px)" srcSet="/images/hero-portrait.webp" />
        <img
          src="/images/hero-banner.webp"
          alt=""
          className="w-full h-full object-cover object-right"
        />
      </picture>
      {/* Gradient overlay for text readability */}
      <div className="absolute inset-0 bg-gradient-to-r from-paper via-paper/80 to-transparent pointer-events-none" />

      <div className="container-custom relative z-10 py-20 md:py-28">
        <div className="max-w-xl">
          <span className="inline-flex items-center gap-2 text-accent-dark font-medium text-sm mb-6 bg-accent/15 px-4 py-2 rounded-full ring-1 ring-accent/30">
            <Sparkles className="w-4 h-4 fill-accent" aria-hidden="true" />
            Tác phẩm mới ra mắt
          </span>

          <h1 className="font-serif text-5xl md:text-6xl lg:text-7xl font-bold text-primary leading-[1.1] mb-6 tracking-tight">
            {titleParts.lead}
            {titleParts.accent && (
              <>
                <br />
                <span className="text-accent italic relative">
                  {titleParts.accent}
                  <svg
                    className="absolute w-full h-3 -bottom-1 left-0 text-accent/50"
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

          <p className="font-sans italic text-xl md:text-2xl text-primary/70 mb-6">
            &ldquo;{displaySubtitle}&rdquo;
          </p>

          <p className="text-gray-700 mb-10 leading-relaxed text-lg">
            {featuredBook.short_description}
          </p>

          <div className="flex flex-wrap items-center gap-6">
            <Link
              href={`/sach/${featuredBook.slug}`}
              className="btn btn-primary group px-8 py-4 text-lg shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-accent/30 hover:bg-primary-light hover:-translate-y-0.5 transition-all"
            >
              Đặt Hàng Ngay
              <ArrowRight
                className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform"
                aria-hidden="true"
              />
            </Link>

            <div className="flex flex-col">
              <span className="text-sm text-gray-600 font-medium uppercase tracking-wider">
                Giá bán
              </span>
              <span className="text-3xl font-serif font-bold text-primary">
                {formatPrice(featuredBook.price)}
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
