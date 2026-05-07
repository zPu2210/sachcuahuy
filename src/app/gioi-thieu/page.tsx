import { Metadata } from "next";
import { MapPin, BookOpen, Mic } from "lucide-react";
import { BookCard } from "@/components/book/book-card";
import { buildAssetUrlFromFile } from "@/lib/directus-assets";
import { getBooks } from "@/lib/books";
import { sanitizeHtml } from "@/lib/sanitize-html";
import { getSiteSettings } from "@/lib/site-config";
import { WatercolorWash } from "@/components/ui/watercolor-wash";
import { PaperTexture } from "@/components/ui/paper-texture";
import { HandDrawnDivider } from "@/components/ui/hand-drawn-divider";
import { SignatureFlourish } from "@/components/ui/signature-flourish";
import { JsonLdPerson } from "@/components/seo/json-ld";

export const revalidate = 300;

const AUTHOR_NAME = "Trọng Huy";
const AUTHOR_LOCATION = "Sài Gòn, Việt Nam";
const AUTHOR_FALLBACK_BIO_HTML =
  "<p>Trọng Huy là phát thanh viên radio và Voice Talent Quảng Cáo tại Việt Nam. Bên cạnh công việc giọng nói, anh còn là một người viết với những tản văn nhẹ nhàng về cuộc sống đời thường.</p>";

export async function generateMetadata(): Promise<Metadata> {
  try {
    const settings = await getSiteSettings();
    const description = (settings.author_bio || AUTHOR_FALLBACK_BIO_HTML)
      .replace(/<[^>]+>/g, "")
      .trim();
    return {
      title: "Về Tác Giả",
      description,
      alternates: { canonical: "/gioi-thieu" },
      openGraph: {
        title: "Về Tác Giả Trọng Huy",
        description,
        type: "profile",
      },
    };
  } catch {
    return { title: "Về Tác Giả", alternates: { canonical: "/gioi-thieu" } };
  }
}

export default async function AboutPage() {
  const [books, settings] = await Promise.all([getBooks(), getSiteSettings()]);
  const publishedBooks = books.filter((b) => !b.is_coming_soon);
  const bioHtml = sanitizeHtml(settings.author_bio || AUTHOR_FALLBACK_BIO_HTML);
  const authorQuote =
    settings.author_short_bio ||
    "Sinh ra tại Phú Thọ, lớn lên ở Hà Nội, chọn sống ở Sài Gòn.";
  const authorImageUrl = buildAssetUrlFromFile(settings.author_image, {
    width: 480,
    height: 480,
    format: "webp",
    quality: 85,
  });
  const authorDescription = (settings.author_bio || AUTHOR_FALLBACK_BIO_HTML)
    .replace(/<[^>]+>/g, "")
    .trim();
  const sameAs = [
    settings.social_facebook,
    settings.social_instagram,
    settings.social_zalo,
  ].filter((s): s is string => !!s && s.length > 0);

  return (
    <div className="min-h-screen">
      <JsonLdPerson
        name={AUTHOR_NAME}
        jobTitle="Phát thanh viên Radio, Voice Talent, Nhà văn"
        description={authorDescription}
        imageUrl={authorImageUrl}
        sameAs={sameAs}
      />
      <section className="relative py-16 md:py-24 bg-primary text-white overflow-hidden">
        <WatercolorWash color="cobalt" className="inset-0 opacity-30" />
        <PaperTexture className="opacity-[0.03]" />
        <div className="container-custom text-center relative z-10">
          <h1 className="font-serif text-3xl md:text-4xl font-semibold mb-6">
            Về Tác Giả
          </h1>

          <div className="w-32 h-32 md:w-40 md:h-40 rounded-full bg-white/10 border-4 border-accent/30 mx-auto mb-6 overflow-hidden ring-4 ring-white/10">
            {authorImageUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={authorImageUrl}
                alt={AUTHOR_NAME}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-accent to-accent flex items-center justify-center">
                <span className="text-primary font-serif text-4xl font-bold">TH</span>
              </div>
            )}
          </div>

          <h2 className="font-serif text-2xl md:text-3xl font-semibold mb-2">
            {AUTHOR_NAME}
          </h2>
          <p className="text-white/70">
            Tác giả • <span lang="en">Voice Talent</span>
          </p>
        </div>
      </section>

      <section className="relative section bg-paper">
        <PaperTexture />
        <div className="container-custom relative z-10">
          <div className="max-w-3xl mx-auto">
            <blockquote className="font-script text-2xl md:text-3xl text-ink/70 text-center mb-8">
              &ldquo;{authorQuote}&rdquo;
            </blockquote>

            <div className="flex justify-center mb-10">
              <HandDrawnDivider variant="sparkle" width={160} />
            </div>

            <div
              className="prose prose-lg prose-gray max-w-none text-ink/80 leading-relaxed"
              dangerouslySetInnerHTML={{ __html: bioHtml }}
            />

            <div className="grid md:grid-cols-3 gap-6 mt-12">
              <div className="bg-cream rounded-xl p-6 border border-accent/10 text-center shadow-sm">
                <MapPin className="w-8 h-8 text-accent mx-auto mb-3" aria-hidden="true" />
                <p className="text-sm text-ink/70">Hiện đang sống tại</p>
                <p className="font-semibold text-navy">{AUTHOR_LOCATION}</p>
              </div>
              <div className="bg-cream rounded-xl p-6 border border-accent/10 text-center shadow-sm">
                <BookOpen className="w-8 h-8 text-accent mx-auto mb-3" aria-hidden="true" />
                <p className="text-sm text-ink/70">Sách đã xuất bản</p>
                <p className="font-semibold text-navy">
                  {publishedBooks.length}+ cuốn
                </p>
              </div>
              <div className="bg-cream rounded-xl p-6 border border-accent/10 text-center shadow-sm">
                <Mic className="w-8 h-8 text-accent mx-auto mb-3" aria-hidden="true" />
                <p className="text-sm text-ink/70">Nghề nghiệp</p>
                <p className="font-semibold text-navy">
                  <span lang="en">Voice Talent</span>
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="relative section bg-cream overflow-hidden">
        <WatercolorWash color="sunset" className="inset-0 opacity-20" />
        <div className="container-custom relative z-10">
          <div className="flex justify-center mb-8">
            <HandDrawnDivider variant="leaf" width={140} />
          </div>
          <h2 className="font-serif text-2xl md:text-3xl font-semibold text-navy text-center mb-12">
            Tác Phẩm
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {publishedBooks.map((book) => (
              <BookCard key={book.id} book={book} headingLevel={3} />
            ))}
          </div>

          <div className="flex justify-center mt-16">
            <SignatureFlourish className="w-48 md:w-56" />
          </div>
        </div>
      </section>
    </div>
  );
}
