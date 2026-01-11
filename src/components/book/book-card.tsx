import Link from "next/link";
import { ShoppingCart, Bell, Book as BookIcon } from "lucide-react";
import { Book, formatPrice } from "@/lib/data";

interface BookCardProps {
  book: Book;
}

export function BookCard({ book }: BookCardProps) {
  const isComingSoon = book.isComingSoon;

  return (
    <div className="card card-hover overflow-hidden cursor-pointer group">
      <Link href={isComingSoon ? "#" : `/sach/${book.slug}`}>
        <div className="aspect-[3/4] relative overflow-hidden bg-primary">
          {/* Book Cover Placeholder - matching navy theme */}
          <div
            className={`absolute inset-0 flex flex-col items-center justify-center p-6 text-white group-hover:scale-105 transition-transform duration-500 ${
              isComingSoon ? "bg-gray-200" : "bg-primary"
            }`}
          >
            {isComingSoon ? (
              <div className="text-gray-400 flex flex-col items-center">
                <BookIcon className="w-16 h-16 mb-4 opacity-50" />
                <span className="font-medium">Sắp ra mắt</span>
              </div>
            ) : (
              <>
                <span className="font-serif text-xs tracking-wider mb-3">
                  TRỌNG HUY
                </span>
                <div className="w-20 h-20 bg-white/90 rounded-[40%] flex items-center justify-center transform rotate-[-5deg]">
                  <span className="font-script text-navy text-sm text-center leading-tight px-2">
                    {book.title.length > 20
                      ? book.title.substring(0, 20) + "..."
                      : book.title}
                  </span>
                </div>
              </>
            )}
          </div>

          {/* Badge */}
          {book.isNew && (
            <span className="absolute top-4 left-4 px-3 py-1 bg-accent text-primary text-xs font-semibold rounded-full">
              Mới
            </span>
          )}
        </div>
      </Link>

      <div className="p-6">
        <Link href={isComingSoon ? "#" : `/sach/${book.slug}`}>
          <h3
            className={`font-serif text-xl font-semibold mb-2 ${
              isComingSoon ? "text-gray-400" : "text-primary"
            }`}
          >
            {book.title}
          </h3>
        </Link>
        <p className={`text-sm mb-3 ${isComingSoon ? "text-gray-400" : "text-gray-500"}`}>
          {book.author} • {book.publishedDate}
        </p>
        <div className="flex items-center justify-between">
          <span
            className={`font-semibold text-lg ${
              isComingSoon ? "text-gray-400" : "text-accent"
            }`}
          >
            {isComingSoon ? "Sắp ra mắt" : formatPrice(book.price)}
          </span>
          <button
            className={`p-2 rounded-lg transition-colors cursor-pointer ${
              isComingSoon
                ? "text-gray-300 cursor-not-allowed"
                : "text-gray-400 hover:text-primary hover:bg-primary/5"
            }`}
            disabled={isComingSoon}
            aria-label={isComingSoon ? "Thông báo khi có hàng" : "Thêm vào giỏ"}
          >
            {isComingSoon ? (
              <Bell className="w-5 h-5" />
            ) : (
              <ShoppingCart className="w-5 h-5" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
