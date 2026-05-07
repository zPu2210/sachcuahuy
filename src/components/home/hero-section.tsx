import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";
import { buildAssetUrlFromFile } from "@/lib/directus-assets";
import { formatPrice } from "@/lib/utils";
import { WatercolorWash } from "@/components/ui/watercolor-wash";
import { HandDrawnDivider } from "@/components/ui/hand-drawn-divider";
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
  const coverUrl =
    buildAssetUrlFromFile(featuredBook.cover_image, {
      width: 800,
      format: "webp",
      quality: 85,
    }) ?? "/images/book-cover-front.png?v=1";

  return (
    <section className="relative min-h-[90vh] flex items-center overflow-hidden bg-paper">
      {/* Watercolor hero background */}
      <picture className="absolute inset-0 pointer-events-none">
        <source
          media="(max-width: 768px)"
          srcSet="/images/hero-portrait.webp"
        />
        <img
          src="/images/hero-landscape.webp"
          alt=""
          className="w-full h-full object-cover opacity-30"
        />
      </picture>
      <div className="absolute inset-0 bg-gradient-to-r from-paper via-paper/90 to-paper/70 pointer-events-none" />

      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <WatercolorWash
          color="cobalt"
          className="top-[-10%] right-[-10%] w-[640px] h-[640px] rounded-full opacity-50"
        />
        <WatercolorWash
          color="terracotta"
          className="bottom-[-15%] left-[-10%] w-[560px] h-[560px] rounded-full opacity-40"
        />
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
          }}
        ></div>

        <HandDrawnDivider
          variant="sparkle"
          className="absolute top-24 left-6 md:left-12 text-accent/70"
          width={120}
        />
        <HandDrawnDivider
          variant="sparkle"
          className="absolute bottom-16 right-6 md:right-16 text-cobalt/70 rotate-12"
          width={140}
        />
      </div>

      <div className="container-custom relative z-10 pt-28 pb-12 md:py-20">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          <div className="order-2 lg:order-1">
            <span className="inline-flex items-center gap-2 text-accent-dark font-medium text-sm mb-6 bg-accent/15 px-4 py-2 rounded-full ring-1 ring-accent/30 w-fit">
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

            <p className="text-gray-700 mb-10 leading-relaxed text-lg max-w-lg">
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

          <div className="order-1 lg:order-2 flex justify-center mt-8 md:mt-0">
            <div className="relative group">
              <div className="absolute inset-0 bg-accent/15 blur-[60px] rounded-full transform scale-110 group-hover:scale-125 transition-transform duration-700"></div>
              <div className="absolute inset-0 bg-cobalt/10 blur-[80px] rounded-full transform scale-125"></div>

              <Link
                href={`/sach/${featuredBook.slug}`}
                className="relative block transition-all duration-500 ease-out cursor-pointer group"
              >
                <div className="relative w-[300px] md:w-[350px] aspect-[1/1.45] bg-cobalt-dark rounded-sm shadow-2xl overflow-hidden">
                  <Image
                    src={coverUrl}
                    alt={`${featuredBook.title} - ${featuredBook.author}`}
                    fill
                    sizes="(min-width: 768px) 350px, 300px"
                    className="object-cover"
                    priority
                  />
                  <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/5 to-white/10 pointer-events-none z-20 mix-blend-overlay opacity-50"></div>
                  <div className="absolute left-0 top-0 bottom-0 w-[4px] bg-gradient-to-r from-black/20 to-transparent z-20"></div>
                </div>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
