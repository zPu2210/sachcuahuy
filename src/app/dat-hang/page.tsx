import { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ChevronRight, Minus, Plus, Trash2 } from "lucide-react";
import { books, formatPrice } from "@/lib/data";
import { OrderForm } from "@/components/checkout/order-form";

export const metadata: Metadata = {
  title: "Đặt Hàng - Sách Của Huy",
  description: "Đặt mua sách văn học của Trọng Huy",
};

export default function CheckoutPage() {
  // For MVP, we'll show the featured book
  const book = books.find((b) => b.isNew) || books[0];
  const quantity = 1;
  const subtotal = book.price * quantity;
  const shipping = subtotal >= 300000 ? 0 : 25000;
  const total = subtotal + shipping;

  return (
    <div className="min-h-screen bg-secondary">
      {/* Breadcrumb */}
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
            {/* Order Form */}
            <div className="lg:col-span-2">
              <OrderForm />
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 sticky top-24">
                <h2 className="font-serif text-xl font-semibold text-primary mb-6">
                  Đơn Hàng Của Bạn
                </h2>

                {/* Item */}
                <div className="flex gap-4 pb-6 border-b border-gray-100">
                  {/* Book thumbnail */}
                  <div className="w-20 h-24 bg-primary rounded-lg flex-shrink-0 flex items-center justify-center">
                    <span className="font-script text-white text-xs text-center">
                      Miền Nam
                      <br />
                      của Huy
                    </span>
                  </div>

                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-primary truncate">{book.title}</h3>
                    <p className="text-sm text-gray-500">{book.author}</p>
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-accent font-semibold">
                        {formatPrice(book.price)}
                      </span>
                      <span className="text-sm text-gray-500">x{quantity}</span>
                    </div>
                  </div>
                </div>

                {/* Totals */}
                <div className="py-6 space-y-3">
                  <div className="flex justify-between text-gray-600">
                    <span>Tạm tính</span>
                    <span>{formatPrice(subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>Phí ship</span>
                    <span>
                      {shipping === 0 ? (
                        <span className="text-green-600">Miễn phí</span>
                      ) : (
                        formatPrice(shipping)
                      )}
                    </span>
                  </div>
                  {shipping > 0 && (
                    <p className="text-xs text-gray-500">
                      Miễn phí ship cho đơn từ 300,000đ
                    </p>
                  )}
                </div>

                {/* Total */}
                <div className="border-t border-gray-100 pt-6">
                  <div className="flex justify-between items-center">
                    <span className="font-semibold text-primary">Tổng cộng</span>
                    <span className="text-2xl font-serif font-semibold text-accent">
                      {formatPrice(total)}
                    </span>
                  </div>
                </div>

                {/* Coupon */}
                <div className="mt-6 pt-6 border-t border-gray-100">
                  <label className="text-sm text-gray-600 block mb-2">
                    Mã giảm giá
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      className="input flex-1"
                      placeholder="Nhập mã..."
                    />
                    <button className="btn btn-outline px-4">Áp dụng</button>
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
