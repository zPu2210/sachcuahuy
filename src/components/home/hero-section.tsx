"use client";

import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";
import { books, formatPrice } from "@/lib/data";
import { FadeIn } from "@/components/ui/fade-in";
import { motion } from "framer-motion";

export function HeroSection() {
  const featuredBook = books.find((b) => b.isNew) || books[0];

  return (
    <section className="relative min-h-[90vh] flex items-center overflow-hidden bg-[#FDFBF7]">
      {/* Background Decor */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-accent/5 rounded-full blur-[100px] transform translate-x-1/2 -translate-y-1/2"></div>
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[100px] transform -translate-x-1/2 translate-y-1/2"></div>
        {/* Noise texture */}
        <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }}></div>
      </div>

      <div className="container-custom relative z-10 py-12 md:py-20">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          {/* Text Content */}
          <div className="order-2 lg:order-1">
            <FadeIn delay={0.1}>
              <span className="inline-flex items-center gap-2 text-accent font-medium text-sm mb-6 bg-accent/10 px-4 py-2 rounded-full ring-1 ring-accent/20 w-fit">
                <Sparkles className="w-4 h-4 fill-accent" />
                Tác phẩm mới ra mắt
              </span>
            </FadeIn>

            <FadeIn delay={0.2}>
              <h1 className="font-serif text-5xl md:text-6xl lg:text-7xl font-bold text-primary leading-[1.1] mb-6 tracking-tight">
                Miền Nam <br />
                <span className="text-accent italic relative">
                  của Huy
                  <svg className="absolute w-full h-3 -bottom-1 left-0 text-accent/30" viewBox="0 0 100 10" preserveAspectRatio="none">
                    <path d="M0 5 Q 50 10 100 5" stroke="currentColor" strokeWidth="2" fill="none" />
                  </svg>
                </span>
              </h1>
            </FadeIn>

            <FadeIn delay={0.3}>
              <p className="font-script text-2xl md:text-3xl text-gray-500 mb-6">
                &ldquo;Nơi ấy có Mina và một mái nhà&rdquo;
              </p>
            </FadeIn>

            <FadeIn delay={0.4}>
              <p className="text-gray-600 mb-10 leading-relaxed text-lg max-w-lg">
                {featuredBook.shortDescription}
              </p>
            </FadeIn>

            <FadeIn delay={0.5} className="flex flex-wrap items-center gap-6">
              <Link href={`/sach/${featuredBook.slug}`} className="btn btn-primary group px-8 py-4 text-lg">
                Đặt Hàng Ngay
                <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
              </Link>

              <div className="flex flex-col">
                <span className="text-sm text-gray-500 font-medium uppercase tracking-wider">Giá bán</span>
                <span className="text-3xl font-serif font-bold text-primary">
                  {formatPrice(featuredBook.price)}
                </span>
              </div>
            </FadeIn>

            <FadeIn delay={0.6} className="mt-12 flex items-center gap-4 text-sm text-gray-500">
              <div className="flex -space-x-3">
                {[1, 2, 3].map(i => (
                  <div key={i} className="w-10 h-10 rounded-full border-2 border-white bg-gray-200 flex items-center justify-center text-xs overflow-hidden">
                    <img src={`https://api.dicebear.com/9.x/avataaars/svg?seed=${i}`} alt="avatar" />
                  </div>
                ))}
              </div>
              <p>Đã được <strong className="text-primary">100+</strong> độc giả yêu thích</p>
            </FadeIn>
          </div>

          {/* 3D Book Visualization */}
          <div className="order-1 lg:order-2 flex justify-center perspective-1000">
            <motion.div
              initial={{ opacity: 0, scale: 0.8, rotateY: -30 }}
              animate={{ opacity: 1, scale: 1, rotateY: 0 }}
              transition={{ duration: 1, delay: 0.2 }}
              className="relative group"
            >
              {/* Glow behind */}
              <div className="absolute inset-0 bg-accent/20 blur-[60px] rounded-full transform scale-110 group-hover:scale-125 transition-transform duration-700"></div>

              {/* 3D Book Container */}
              <Link href={`/sach/${featuredBook.slug}`} className="relative block transform-style-3d hover:rotate-y-[-10deg] hover:rotate-x-[5deg] transition-all duration-500 ease-out cursor-pointer" style={{ transformStyle: 'preserve-3d', perspective: '1000px' }}>

                {/* Book Spine (Left) */}
                <div className="absolute left-0 top-0 bottom-0 w-[40px] bg-[#141D36] transform -translate-x-[20px] translate-z-[-20px] rotate-y-[-90deg] flex flex-col items-center justify-center border-l border-white/10">
                  <span className="font-serif text-white/80 tracking-[0.2em] text-xs rotate-90 whitespace-nowrap">TRỌNG HUY</span>
                </div>

                {/* Book Pages (Right side thickness) */}
                <div className="absolute right-0 top-2 bottom-2 w-[30px] bg-white transform translate-x-[15px] translate-z-[-15px] rotate-y-[90deg] shadow-inner"
                  style={{ backgroundImage: 'linear-gradient(to right, #e5e5e5 1px, transparent 1px)', backgroundSize: '4px 100%' }}>
                </div>

                {/* Front Cover */}
                <div className="relative w-[300px] md:w-[380px] aspect-[3/4.5] bg-[#1E2B4D] rounded-r-sm rounded-l-md shadow-2xl overflow-hidden transform translate-z-[20px] border-r-2 border-white/5">
                  {/* Texture Overlay */}
                  <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/leather.png')] opacity-30 mix-blend-overlay"></div>

                  {/* Sheen/Reflection */}
                  <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/5 to-white/10 pointer-events-none z-10"></div>

                  {/* Book Content */}
                  <div className="absolute inset-0 flex flex-col items-center justify-center p-12 text-center text-white z-0">
                    <span className="font-serif text-sm tracking-[0.3em] mb-12 opacity-80 border-b border-accent/50 pb-2">TRỌNG HUY</span>

                    <div className="relative mb-12">
                      <div className="absolute inset-0 border border-accent/30 rounded-full transform scale-110"></div>
                      <div className="w-40 h-40 bg-white/95 rounded-full flex items-center justify-center shadow-lg transform group-hover:scale-105 transition-transform duration-500">
                        <div className="text-center transform -rotate-6">
                          <span className="font-script text-navy text-3xl block leading-none">Miền Nam</span>
                          <span className="font-sans text-accent font-bold text-sm tracking-widest uppercase mt-1 block">của Huy</span>
                        </div>
                      </div>
                    </div>

                    <div className="mt-auto space-y-4">
                      <div className="w-8 h-8 rounded-full border border-white/20 mx-auto flex items-center justify-center">
                        <span className="text-[10px] font-bold">TH</span>
                      </div>
                      <span className="text-[10px] tracking-widest opacity-50 block">NHÀ XUẤT BẢN DÂN TRÍ</span>
                    </div>
                  </div>

                  {/* Gold Foil Effect on Title */}
                </div>

                {/* Back Cover (just a darker slab behind) */}
                <div className="absolute inset-0 bg-[#0f1629] rounded-l-md transform translate-z-[-20px] shadow-2xl"></div>

              </Link>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
