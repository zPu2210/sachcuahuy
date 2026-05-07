import type { Book, SiteSettings } from "@/lib/types-directus";

const SITE_NAME = "Sách Của Huy";
const AUTHOR_NAME = "Trọng Huy";

function siteUrl(): string {
  return process.env.NEXT_PUBLIC_SITE_URL ?? "https://sachcuahuy.vercel.app";
}

export function JsonLdOrganization({ settings }: { settings: SiteSettings }) {
  const url = siteUrl();
  const sameAs = [
    settings.social_facebook,
    settings.social_instagram,
    settings.social_zalo,
  ].filter((s): s is string => !!s && s.length > 0);

  const data: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: SITE_NAME,
    url,
    logo: `${url}/images/book-cover-front.png`,
  };
  if (settings.contact_phone || settings.contact_email) {
    data.contactPoint = {
      "@type": "ContactPoint",
      contactType: "sales",
      ...(settings.contact_phone && { telephone: settings.contact_phone }),
      ...(settings.contact_email && { email: settings.contact_email }),
    };
  }
  if (sameAs.length > 0) {
    data.sameAs = sameAs;
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

export function JsonLdBook({
  book,
  coverUrl,
}: {
  book: Book;
  coverUrl: string | null;
}) {
  const url = `${siteUrl()}/sach/${book.slug}`;
  const data: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "Book",
    name: book.title,
    author: { "@type": "Person", name: book.author || AUTHOR_NAME },
    inLanguage: "vi",
    url,
    offers: {
      "@type": "Offer",
      price: book.price,
      priceCurrency: "VND",
      availability:
        book.stock_status === "in_stock"
          ? "https://schema.org/InStock"
          : "https://schema.org/OutOfStock",
      url,
    },
  };
  if (book.short_description) data.description = book.short_description;
  if (book.isbn) data.isbn = book.isbn;
  if (book.publisher) data.publisher = book.publisher;
  if (coverUrl) data.image = coverUrl;
  if (book.published_date) data.datePublished = book.published_date;
  if (book.page_count) data.numberOfPages = book.page_count;

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

export function JsonLdPerson({
  name,
  jobTitle,
  description,
  imageUrl,
  sameAs,
}: {
  name: string;
  jobTitle?: string;
  description?: string;
  imageUrl?: string | null;
  sameAs?: string[];
}) {
  const url = siteUrl();
  const data: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "Person",
    name,
    url: `${url}/gioi-thieu`,
  };
  if (jobTitle) data.jobTitle = jobTitle;
  if (description) data.description = description;
  if (imageUrl) data.image = imageUrl;
  if (sameAs && sameAs.length > 0) data.sameAs = sameAs;

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
