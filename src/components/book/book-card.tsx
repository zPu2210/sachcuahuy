"use client";

import Link from "next/link";
import { ShoppingCart, Eye, Book as BookIcon } from "lucide-react";
import clsx from "clsx";
import { formatPrice } from "@/lib/books";
import { buildAssetUrl } from "@/lib/directus";
import type { Book } from "@/lib/types-directus";

interface BookCardProps {
  book: Book;
  featured?: boolean;
}

function getCoverUrl(book: Book): string | null {
  const cover = book.cover_image;
  if (!cover) return null;
  if (typeof cover === "string") return cover;
  if (cover.id) return buildAssetUrl(cover.id, { width: 600, format: "webp" });
  return null;
}

export function BookCard({ book }: BookCardProps) {
  const isComingSoon = !!book.is_coming_soon;
  const isOutOfStock = book.stock_status === "out_of_stock";
  const coverUrl = getCoverUrl(book);

  return (
    <div
      className={clsx(
        "group relative bg-white rounded-2xl transition-all duration-300 ease-[cubic-bezier(0.25,0.8,0.25,1)]",
        "hover:shadow-[0_20px_40px_-12px_rgba(0,0,0,0.1)] hover:-translate-y-2",
      )}
    >
      <div className="relative aspect-[3/4.2] overflow-hidden rounded-t-2xl bg-[#F0F0F0]">
        <Link
          href={isComingSoon ? "#" : `/sach/${book.slug}`}
          className="block w-full h-full"
        >
          {!isComingSoon && coverUrl ? (
            <div className="absolute inset-0 bg-[#E0E0E0] group-hover:scale-105 transition-transform duration-700 ease-out">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={coverUrl}
                alt={book.title}
                className="w-full h-full object-cover"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-black/5 mix-blend-multiply"></div>
            </div>
          ) : (
            <div
              className={clsx(
                "absolute inset-0 flex flex-col items-center justify-center p-6 text-white transition-transform duration-700 ease-out group-hover:scale-105",
                isComingSoon ? "bg-gray-200" : "bg-[#1E2B4D]",
              )}
            >
              {!isComingSoon && (
                <div className="absolute inset-0 bg-white opacity-[0.03] bg-[url('https://www.transparenttextures.com/patterns/leather.png')]"></div>
              )}

              {isComingSoon ? (
                <div className="text-gray-400 flex flex-col items-center">
                  <BookIcon className="w-12 h-12 mb-3 opacity-50" />
                  <span className="font-medium text-sm">Sắp ra mắt</span>
                </div>
              ) : (
                <div className="w-full h-full border border-white/10 p-4 flex flex-col items-center justify-center relative z-10">
                  <span className="font-serif text-[10px] tracking-[0.2em] mb-6 opacity-80">
                    {book.author.toUpperCase()}
                  </span>
                  <div className="w-24 h-24 rounded-full bg-white text-primary flex items-center justify-center shadow-lg transform -rotate-3 mb-6">
                    <div className="text-center leading-none px-2">
                      <span className="font-script text-base block break-words">
                        {book.title}
                      </span>
                    </div>
                  </div>
                  <div className="mt-auto border-t border-white/20 pt-3 w-12 text-center">
                    <span className="text-[8px] font-bold opacity-60">
                      {book.publisher ? "NXB" : ""}
                    </span>
                  </div>
                </div>
              )}
            </div>
          )}
        </Link>

        {!isComingSoon && (
          <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-3 opacity-0 group-hover:opacity-100 transform translate-y-4 group-hover:translate-y-0 transition-all duration-300 px-4">
            <Link
              href={`/sach/${book.slug}`}
              className="bg-white text-primary p-3 rounded-full shadow-lg hover:bg-accent hover:text-white transition-colors"
              title="Xem chi tiết"
            >
              <Eye className="w-4 h-4" />
            </Link>
            {!isOutOfStock && (
              <Link
                href={`/dat-hang?slug=${book.slug}`}
                className="bg-primary text-white p-3 rounded-full shadow-lg hover:bg-primary/90 transition-colors"
                title="Đặt hàng"
              >
                <ShoppingCart className="w-4 h-4" />
              </Link>
            )}
          </div>
        )}

        <div className="absolute top-3 left-3 flex flex-col gap-2">
          {book.is_new && !isComingSoon && (
            <span className="px-3 py-1 bg-accent text-white text-[10px] font-bold tracking-wider uppercase rounded-sm shadow-sm">
              Mới
            </span>
          )}
          {isOutOfStock && !isComingSoon && (
            <span className="px-3 py-1 bg-gray-700 text-white text-[10px] font-bold tracking-wider uppercase rounded-sm shadow-sm">
              Hết hàng
            </span>
          )}
        </div>
      </div>

      <div className="p-5">
        <Link href={isComingSoon ? "#" : `/sach/${book.slug}`}>
          <h3
            className={clsx(
              "font-serif text-xl font-bold mb-1 line-clamp-1 transition-colors",
              isComingSoon
                ? "text-gray-400"
                : "text-primary group-hover:text-accent",
            )}
          >
            {book.title}
          </h3>
        </Link>
        <p className="text-xs text-gray-500 mb-4 font-medium uppercase tracking-wide">
          {book.author}
        </p>

        <div className="flex items-center justify-between pt-4 border-t border-gray-100">
          <span
            className={clsx(
              "font-serif font-bold text-lg",
              isComingSoon ? "text-gray-300" : "text-primary",
            )}
          >
            {isComingSoon ? "---" : formatPrice(book.price)}
          </span>

          {!isComingSoon && (
            <span
              className={clsx(
                "text-xs font-medium",
                isOutOfStock
                  ? "text-gray-400"
                  : "text-gray-400 group-hover:text-accent transition-colors",
              )}
            >
              {isOutOfStock ? "Hết hàng" : "Xem chi tiết →"}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
