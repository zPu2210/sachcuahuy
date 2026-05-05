import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";
import { buildAssetUrlFromFile } from "@/lib/directus-assets";
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
  const coverUrl =
    buildAssetUrlFromFile(featuredBook.cover_image, {
      width: 800,
      format: "webp",
      quality: 85,
    }) ?? "/images/book-cover-front.png?v=1";
  const spineLabel = featuredBook.publisher || featuredBook.author;

  return (
    <section className="relative min-h-[90vh] flex items-center overflow-hidden bg-[#FDFBF7]">
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-accent/5 rounded-full blur-[100px] transform translate-x-1/2 -translate-y-1/2"></div>
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[100px] transform -translate-x-1/2 translate-y-1/2"></div>
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
          }}
        ></div>
      </div>

      <div className="container-custom relative z-10 pt-28 pb-12 md:py-20">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          <div className="order-2 lg:order-1">
            <div>
              <span className="inline-flex items-center gap-2 text-accent font-medium text-sm mb-6 bg-accent/10 px-4 py-2 rounded-full ring-1 ring-accent/20 w-fit">
                <Sparkles className="w-4 h-4 fill-accent" />
                Tác phẩm mới ra mắt
              </span>
            </div>

            <div>
              <h1 className="font-serif text-5xl md:text-6xl lg:text-7xl font-bold text-primary leading-[1.1] mb-6 tracking-tight">
                {titleParts.lead}
                {titleParts.accent && (
                  <>
                    <br />
                    <span className="text-accent italic relative">
                      {titleParts.accent}
                      <svg
                        className="absolute w-full h-3 -bottom-1 left-0 text-accent/30"
                        viewBox="0 0 100 10"
                        preserveAspectRatio="none"
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
            </div>

            <div>
              <p className="font-script text-2xl md:text-3xl text-gray-500 mb-6">
                &ldquo;{displaySubtitle}&rdquo;
              </p>
            </div>

            <div>
              <p className="text-gray-600 mb-10 leading-relaxed text-lg max-w-lg">
                {featuredBook.short_description}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-6">
              <Link
                href={`/sach/${featuredBook.slug}`}
                className="btn btn-primary group px-8 py-4 text-lg"
              >
                Đặt Hàng Ngay
                <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
              </Link>

              <div className="flex flex-col">
                <span className="text-sm text-gray-500 font-medium uppercase tracking-wider">
                  Giá bán
                </span>
                <span className="text-3xl font-serif font-bold text-primary">
                  {formatPrice(featuredBook.price)}
                </span>
              </div>
            </div>

            <div className="mt-12 flex items-center gap-4 text-sm text-gray-500">
              <div className="flex -space-x-3">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="w-10 h-10 rounded-full border-2 border-white bg-gray-200 flex items-center justify-center text-xs overflow-hidden"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={`https://api.dicebear.com/9.x/avataaars/svg?seed=${i}`}
                      alt="avatar"
                    />
                  </div>
                ))}
              </div>
              <p>
                Đã được <strong className="text-primary">100+</strong> độc giả yêu thích
              </p>
            </div>
          </div>

          <div className="order-1 lg:order-2 flex justify-center perspective-1000 mt-8 md:mt-0">
            <div className="relative group">
              <div className="absolute inset-0 bg-accent/20 blur-[60px] rounded-full transform scale-110 group-hover:scale-125 transition-transform duration-700"></div>

              <Link
                href={`/sach/${featuredBook.slug}`}
                className="relative block transform-style-3d hover:rotate-y-[-10deg] hover:rotate-x-[5deg] transition-all duration-500 ease-out cursor-pointer group"
                style={{ transformStyle: "preserve-3d", perspective: "1000px" }}
              >
                <div className="absolute left-0 top-[2px] bottom-[2px] w-[24px] bg-[#1a237e] transform -translate-x-[12px] translate-z-[-12px] rotate-y-[-90deg] flex flex-col items-center justify-center border-l border-white/10 rounded-sm overflow-hidden z-20">
                  <span className="font-serif text-white/80 tracking-[0.2em] text-[8px] rotate-90 whitespace-nowrap mt-auto mb-12 opacity-70">
                    {spineLabel.toUpperCase()}
                  </span>
                </div>

                <div
                  className="absolute right-0 top-1 bottom-1 w-[28px] bg-[#F5F5F0] transform translate-x-[14px] translate-z-[-12px] rotate-y-[90deg] shadow-inner rounded-sm"
                  style={{
                    backgroundImage:
                      "linear-gradient(to right, #e0e0e0 1px, transparent 1px)",
                    backgroundSize: "3px 100%",
                  }}
                ></div>

                <div className="relative w-[300px] md:w-[350px] aspect-[1/1.45] bg-[#1a237e] rounded-sm shadow-2xl overflow-hidden transform translate-z-[12px]">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={coverUrl}
                    alt={`${featuredBook.title} - ${featuredBook.author}`}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/5 to-white/10 pointer-events-none z-20 mix-blend-overlay opacity-50"></div>
                  <div className="absolute left-0 top-0 bottom-0 w-[4px] bg-gradient-to-r from-black/20 to-transparent z-20"></div>
                </div>

                <div className="absolute inset-0 bg-[#0f1629] rounded-sm transform translate-z-[-12px] shadow-2xl"></div>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
