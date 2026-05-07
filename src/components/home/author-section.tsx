import Image from "next/image";
import Link from "next/link";
import { ChevronRight, Feather } from "lucide-react";

interface AuthorSectionProps {
  name: string;
  title: string;
  shortBio: string;
  imageUrl?: string | null;
}

export function AuthorSection({
  name,
  title,
  shortBio,
  imageUrl,
}: AuthorSectionProps) {
  const initials = name
    .split(" ")
    .map((s) => s[0])
    .filter(Boolean)
    .slice(-2)
    .join("")
    .toUpperCase();

  return (
    <section className="section bg-white relative overflow-hidden">
      <div className="absolute top-0 left-0 w-64 h-64 bg-secondary/50 rounded-full blur-[80px] -translate-x-1/2 -translate-y-1/2 pointer-events-none"></div>

      <div className="container-custom relative z-10">
        <div className="flex flex-col md:flex-row items-center gap-10 md:gap-16">
          <div className="flex-shrink-0">
            <div className="relative">
              <div className="absolute inset-0 border-2 border-accent/20 rounded-full transform rotate-6 scale-105"></div>
              <div className="w-40 h-40 md:w-56 md:h-56 rounded-full bg-secondary border-4 border-white shadow-xl overflow-hidden relative z-10">
                {imageUrl ? (
                  <Image
                    src={imageUrl}
                    alt={name}
                    fill
                    sizes="(min-width: 768px) 224px, 160px"
                    className="object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-[#1E2B4D] flex items-center justify-center">
                    <div className="text-center">
                      <span className="font-serif text-4xl md:text-5xl text-accent block">
                        {initials}
                      </span>
                      <span className="text-[10px] text-accent/50 uppercase tracking-widest mt-1">
                        {name}
                      </span>
                    </div>
                  </div>
                )}
              </div>

              <div className="absolute -bottom-2 -right-2 bg-white p-3 rounded-full shadow-lg z-20 text-accent">
                <Feather className="w-5 h-5" aria-hidden="true" />
              </div>
            </div>
          </div>

          <div className="flex-1 text-center md:text-left">
            <div>
              <span className="text-[#7A6125] font-medium text-sm tracking-widest uppercase mb-2 block">
                Về Tác Giả
              </span>
            </div>

            <div>
              <h2 className="font-serif text-3xl md:text-4xl font-bold text-primary mb-3">
                {name}
              </h2>
            </div>

            <div>
              <p className="text-gray-500 font-medium italic mb-6 relative inline-block">
                {title}
                <span className="absolute bottom-0 right-0 w-full h-[1px] bg-accent/30"></span>
              </p>
            </div>

            <div>
              <p className="text-gray-600 leading-relaxed text-lg mb-8 max-w-xl mx-auto md:mx-0">
                &ldquo;{shortBio}&rdquo;
              </p>
            </div>

            <div>
              <Link
                href="/gioi-thieu"
                className="group inline-flex items-center text-primary font-bold hover:text-accent transition-colors border-b-2 border-primary/10 hover:border-accent pb-1"
              >
                Tìm hiểu thêm về hành trình
                <ChevronRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" aria-hidden="true" />
              </Link>
            </div>
          </div>

          <div className="hidden lg:block opacity-10 rotate-[-10deg]">
            <span className="font-script text-6xl md:text-8xl text-primary whitespace-nowrap">
              {name}
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
