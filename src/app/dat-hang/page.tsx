import { notFound } from "next/navigation";
import { Metadata } from "next";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { OrderForm } from "@/components/checkout/order-form";
import { getBookBySlug, getBooks, formatPrice } from "@/lib/books";
import { getSiteSettings } from "@/lib/site-config";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Đặt Hàng",
  description: "Đặt mua sách văn học của Trọng Huy",
  robots: { index: false, follow: false },
};

interface PageProps {
  searchParams: Promise<{ slug?: string; qty?: string }>;
}

export default async function CheckoutPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const requestedSlug = params.slug;
  const qty = Math.min(
    Math.max(parseInt(params.qty ?? "1", 10) || 1, 1),
    10,
  );

  const settings = await getSiteSettings();

  let book = requestedSlug ? await getBookBySlug(requestedSlug) : null;
  if (!book) {
    const all = await getBooks();
    book = all.find((b) => b.is_new) ?? all[0];
  }
  if (!book) notFound();

  const subtotal = book.price * qty;
  // Order summary preview defaults to flat fee; final shipping calculated server-side after city selection.
  const previewShipping = settings.shipping_flat_fee;
  const previewTotal = subtotal + previewShipping;
  const isOutOfStock = book.stock_status === "out_of_stock";

  return (
    <div className="min-h-screen bg-secondary">
      <div className="bg-white border-b border-gray-100">
        <div className="container-custom py-4">
          <nav className="flex items-center gap-2 text-sm text-gray-500">
            <Link href="/" className="hover:text-primary transition-colors">
              Trang chủ
            </Link>
            <ChevronRight className="w-4 h-4" />
            <span className="text-primary font-medium">Đặt Hàng</span>
          </nav>
        </div>
      </div>

      <div className="section">
        <div className="container-custom">
          <h1 className="font-serif text-3xl md:text-4xl font-semibold text-primary mb-8">
            Đặt Hàng
          </h1>

          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <OrderForm
                bookSlug={book.slug}
                qty={qty}
                bankInfo={{
                  name: settings.bank_name,
                  account: settings.bank_account,
                  holder: settings.bank_holder,
                  branch: settings.bank_branch ?? null,
                }}
                shippingFreeCities={settings.shipping_free_cities}
                disabled={isOutOfStock}
              />
            </div>

            <div className="lg:col-span-1">
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 sticky top-24">
                <h2 className="font-serif text-xl font-semibold text-primary mb-6">
                  Đơn Hàng Của Bạn
                </h2>

                <div className="flex gap-4 pb-6 border-b border-gray-100">
                  <div className="w-20 h-24 bg-primary rounded-lg flex-shrink-0 flex items-center justify-center">
                    <span className="font-script text-white text-xs text-center px-2">
                      {book.title}
                    </span>
                  </div>

                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-primary truncate">
                      {book.title}
                    </h3>
                    <p className="text-sm text-gray-500">{book.author}</p>
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-accent font-semibold">
                        {formatPrice(book.price)}
                      </span>
                      <span className="text-sm text-gray-500">x{qty}</span>
                    </div>
                  </div>
                </div>

                <div className="py-6 space-y-3">
                  <div className="flex justify-between text-gray-600">
                    <span>Tạm tính</span>
                    <span>{formatPrice(subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>Phí ship (ước tính)</span>
                    <span>{formatPrice(previewShipping)}</span>
                  </div>
                  <p className="text-xs text-gray-500">
                    Phí ship tính chính xác sau khi chọn tỉnh/thành.{" "}
                    {settings.shipping_free_cities.length > 0 && (
                      <>
                        Miễn phí:{" "}
                        {settings.shipping_free_cities
                          .map((c) => c.toUpperCase())
                          .join(", ")}
                        .
                      </>
                    )}
                  </p>
                </div>

                <div className="border-t border-gray-100 pt-6">
                  <div className="flex justify-between items-center">
                    <span className="font-semibold text-primary">
                      Tổng (ước tính)
                    </span>
                    <span className="text-2xl font-serif font-semibold text-accent">
                      {formatPrice(previewTotal)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
