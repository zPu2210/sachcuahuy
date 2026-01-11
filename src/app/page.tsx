import { HeroSection } from "@/components/home/hero-section";
import { AuthorSection } from "@/components/home/author-section";
import { BooksSection } from "@/components/home/books-section";
import { FeaturesSection } from "@/components/home/features-section";
import { CTASection } from "@/components/home/cta-section";

export default function HomePage() {
  return (
    <>
      <HeroSection />

      {/* Decorative Line */}
      {/* <div className="decorative-line opacity-30 my-8"></div> */}

      <AuthorSection />
      <BooksSection />
      <FeaturesSection />
      <CTASection />
    </>
  );
}
