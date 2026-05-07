"use client";

import Link from "next/link";
import { Mic, Sparkles, ArrowLeft } from "lucide-react";
import { motion } from "framer-motion";
import { WatercolorWash } from "@/components/ui/watercolor-wash";
import { PaperTexture } from "@/components/ui/paper-texture";
import { HandDrawnDivider } from "@/components/ui/hand-drawn-divider";

export function ComingSoonHero() {
  return (
    <section className="relative min-h-[80vh] flex items-center overflow-hidden bg-paper pt-24">
      <WatercolorWash color="cobalt" className="inset-0 opacity-20" />
      <PaperTexture />

      <div className="container-custom relative z-10 py-12 md:py-20 text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6 }}
          className="inline-flex items-center justify-center w-20 h-20 md:w-24 md:h-24 rounded-full bg-accent/10 ring-1 ring-accent/30 mb-6 mx-auto"
        >
          <Mic className="w-10 h-10 md:w-12 md:h-12 text-accent" aria-hidden="true" />
        </motion.div>

        <motion.span
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="inline-flex items-center gap-2 text-accent-dark font-medium text-sm mb-6 bg-accent/10 px-4 py-2 rounded-full ring-1 ring-accent/20"
        >
          <Sparkles className="w-4 h-4 fill-accent" aria-hidden="true" />
          Sắp Ra Mắt
        </motion.span>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.6 }}
          className="font-serif text-4xl md:text-6xl lg:text-7xl font-bold text-navy leading-[1.1] mb-6 tracking-tight"
        >
          Podcast{" "}
          <span className="text-accent italic">Sách Của Huy</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.6 }}
          className="font-script text-2xl md:text-3xl text-ink/60 mb-6"
        >
          &ldquo;Những câu chuyện bên ly cà phê&rdquo;
        </motion.p>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.6 }}
          className="text-ink/70 leading-relaxed text-base md:text-lg max-w-xl mx-auto mb-8"
        >
          Một dự án mới đang được ấp ủ. Hẹn gặp lại quý độc giả trong những tập
          podcast đầu tiên — tản văn, đọc sách, và đối thoại nhỏ về cuộc sống.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.55, duration: 0.5 }}
          className="flex justify-center mb-8"
        >
          <HandDrawnDivider variant="wave" width={140} />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.6 }}
          className="flex flex-wrap justify-center gap-4"
        >
          <Link href="/sach" className="btn btn-primary px-8 py-3 text-base">
            Khám Phá Sách
          </Link>
          <Link href="/" className="btn btn-outline px-8 py-3 text-base">
            <ArrowLeft className="w-4 h-4 mr-2" aria-hidden="true" />
            Về Trang Chủ
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
