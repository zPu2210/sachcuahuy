import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { authorInfo } from "@/lib/data";

export function AuthorSection() {
  return (
    <section className="section bg-white">
      <div className="container-custom">
        <div className="flex flex-col md:flex-row items-center gap-8 md:gap-12">
          {/* Author Photo */}
          <div className="flex-shrink-0">
            <div className="w-32 h-32 md:w-40 md:h-40 rounded-full bg-secondary border-4 border-accent/20 overflow-hidden">
              {/* Placeholder - replace with actual photo */}
              <div className="w-full h-full bg-gradient-to-br from-primary to-primary-light flex items-center justify-center">
                <span className="text-white font-serif text-3xl">TH</span>
              </div>
            </div>
          </div>

          {/* Author Info */}
          <div>
            <h2 className="font-serif text-3xl font-semibold text-primary mb-2">
              {authorInfo.name}
            </h2>
            <p className="text-accent font-medium mb-4">{authorInfo.title}</p>
            <p className="text-gray-600 leading-relaxed max-w-xl mb-6">
              {authorInfo.shortBio}
            </p>
            <Link
              href="/gioi-thieu"
              className="inline-flex items-center text-primary font-medium hover:text-accent transition-colors"
            >
              Tìm hiểu thêm
              <ChevronRight className="w-5 h-5 ml-1" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
