"use client";

import Link from "next/link";
import { ChevronRight, Feather } from "lucide-react";
import { authorInfo } from "@/lib/data";
import { FadeIn } from "@/components/ui/fade-in";

export function AuthorSection() {
  return (
    <section className="section bg-white relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-0 left-0 w-64 h-64 bg-secondary/50 rounded-full blur-[80px] -translate-x-1/2 -translate-y-1/2 pointer-events-none"></div>

      <div className="container-custom relative z-10">
        <div className="flex flex-col md:flex-row items-center gap-10 md:gap-16">
          {/* Author Photo */}
          <FadeIn direction="right" className="flex-shrink-0">
            <div className="relative">
              <div className="absolute inset-0 border-2 border-accent/20 rounded-full transform rotate-6 scale-105"></div>
              <div className="w-40 h-40 md:w-56 md:h-56 rounded-full bg-secondary border-4 border-white shadow-xl overflow-hidden relative z-10">
                {/* Visual placeholder */}
                <div className="w-full h-full bg-[#1E2B4D] flex items-center justify-center">
                  <div className="text-center">
                    <span className="font-serif text-4xl md:text-5xl text-accent block">TH</span>
                    <span className="text-[10px] text-accent/50 uppercase tracking-widest mt-1">Trọng Huy</span>
                  </div>
                </div>
              </div>

              {/* Floating element */}
              <div className="absolute -bottom-2 -right-2 bg-white p-3 rounded-full shadow-lg z-20 text-accent">
                <Feather className="w-5 h-5" />
              </div>
            </div>
          </FadeIn>

          {/* Author Info */}
          <div className="flex-1 text-center md:text-left">
            <FadeIn delay={0.2}>
              <span className="text-accent font-medium text-sm tracking-widest uppercase mb-2 block">Về Tác Giả</span>
            </FadeIn>

            <FadeIn delay={0.3}>
              <h2 className="font-serif text-3xl md:text-4xl font-bold text-primary mb-3">
                {authorInfo.name}
              </h2>
            </FadeIn>

            <FadeIn delay={0.4}>
              <p className="text-gray-500 font-medium italic mb-6 relative inline-block">
                {authorInfo.title}
                <span className="absolute bottom-0 right-0 w-full h-[1px] bg-accent/30"></span>
              </p>
            </FadeIn>

            <FadeIn delay={0.5}>
              <p className="text-gray-600 leading-relaxed text-lg mb-8 max-w-xl mx-auto md:mx-0">
                &ldquo;{authorInfo.shortBio}&rdquo;
              </p>
            </FadeIn>

            <FadeIn delay={0.6}>
              <Link
                href="/gioi-thieu"
                className="group inline-flex items-center text-primary font-bold hover:text-accent transition-colors border-b-2 border-primary/10 hover:border-accent pb-1"
              >
                Tìm hiểu thêm về hành trình
                <ChevronRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
              </Link>
            </FadeIn>
          </div>

          {/* Signature/Quote maybe? */}
          <FadeIn delay={0.7} className="hidden lg:block opacity-10 rotate-[-10deg]">
            <span className="font-script text-6xl md:text-8xl text-primary whitespace-nowrap">Trọng Huy</span>
          </FadeIn>
        </div>
      </div>
    </section>
  );
}
