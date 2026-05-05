"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Info } from "lucide-react";

interface OrderFormProps {
  bookSlug: string;
  qty: number;
  bankInfo: {
    name: string;
    account: string;
    holder: string;
    branch: string | null;
  };
  shippingFreeCities: string[];
  disabled?: boolean;
}

interface OrderResponse {
  order_token: string;
  order_code: string;
  total: number;
  qr_url: string | null;
  confirmation_url: string;
}

export function OrderForm({
  bookSlug,
  qty,
  bankInfo,
  shippingFreeCities,
  disabled = false,
}: OrderFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (disabled) return;
    setIsSubmitting(true);
    setError(null);

    const form = e.currentTarget;
    const formData = new FormData(form);
    const payload = {
      customer_name: String(formData.get("name") ?? "").trim(),
      customer_phone: String(formData.get("phone") ?? "").replace(/\s+/g, ""),
      customer_email: String(formData.get("email") ?? "").trim(),
      shipping_city: String(formData.get("city") ?? ""),
      shipping_district: String(formData.get("district") ?? "").trim(),
      shipping_address: String(formData.get("address") ?? "").trim(),
      note: String(formData.get("note") ?? "").trim(),
      payment_method: "bank",
      items: [{ slug: bookSlug, qty }],
    };

    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = (await res.json().catch(() => ({}))) as
        | OrderResponse
        | { error: string; issues?: unknown };
      if (res.ok && "confirmation_url" in data) {
        router.push(data.confirmation_url);
        return;
      }
      const errCode = "error" in data ? data.error : "unknown";
      if (errCode === "out_of_stock") {
        setError("Sách hiện đã hết hàng. Vui lòng quay lại sau.");
      } else if (errCode === "invalid_input") {
        setError("Thông tin đặt hàng chưa hợp lệ. Vui lòng kiểm tra lại.");
      } else {
        setError("Có lỗi khi đặt hàng. Vui lòng thử lại sau ít phút.");
      }
    } catch {
      setError("Không kết nối được máy chủ. Vui lòng thử lại.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const cityFreeNote =
    shippingFreeCities.length > 0
      ? `Miễn phí ship: ${shippingFreeCities
          .map((c) => c.toUpperCase())
          .join(", ")} • Tỉnh khác: 25.000đ`
      : null;

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Customer Info */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <h2 className="font-serif text-xl font-semibold text-primary mb-6 flex items-center gap-3">
          <span className="w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center text-sm">
            1
          </span>
          Thông Tin Người Nhận
        </h2>

        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="customer-name" className="block text-sm font-medium text-gray-700 mb-2">
              Họ và tên <span className="text-red-500">*</span>
            </label>
            <input
              id="customer-name"
              type="text"
              name="name"
              required
              minLength={2}
              maxLength={100}
              className="input"
              placeholder="Nguyễn Văn A"
            />
          </div>

          <div>
            <label htmlFor="customer-phone" className="block text-sm font-medium text-gray-700 mb-2">
              Số điện thoại <span className="text-red-500">*</span>
            </label>
            <input
              id="customer-phone"
              type="tel"
              name="phone"
              required
              pattern="0[0-9]{9,10}"
              className="input"
              placeholder="0912345678"
            />
          </div>

          <div className="md:col-span-2">
            <label htmlFor="customer-email" className="block text-sm font-medium text-gray-700 mb-2">
              Email
            </label>
            <input
              id="customer-email"
              type="email"
              name="email"
              className="input"
              placeholder="email@example.com"
            />
          </div>
        </div>
      </div>

      {/* Shipping Address */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <h2 className="font-serif text-xl font-semibold text-primary mb-6 flex items-center gap-3">
          <span className="w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center text-sm">
            2
          </span>
          Địa Chỉ Giao Hàng
        </h2>

        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="shipping-city" className="block text-sm font-medium text-gray-700 mb-2">
              Tỉnh/Thành phố <span className="text-red-500">*</span>
            </label>
            <select id="shipping-city" name="city" required defaultValue="" className="input">
              <option value="" disabled>
                Chọn tỉnh/thành phố
              </option>
              <option value="hcm">TP. Hồ Chí Minh</option>
              <option value="hn">Hà Nội</option>
              <option value="dn">Đà Nẵng</option>
              <option value="other">Tỉnh/Thành khác</option>
            </select>
            {cityFreeNote && (
              <p className="text-xs text-gray-500 mt-1">{cityFreeNote}</p>
            )}
          </div>

          <div>
            <label htmlFor="shipping-district" className="block text-sm font-medium text-gray-700 mb-2">
              Quận/Huyện <span className="text-red-500">*</span>
            </label>
            <input
              id="shipping-district"
              type="text"
              name="district"
              required
              maxLength={100}
              className="input"
              placeholder="Quận/Huyện"
            />
          </div>

          <div className="md:col-span-2">
            <label htmlFor="shipping-address" className="block text-sm font-medium text-gray-700 mb-2">
              Địa chỉ chi tiết <span className="text-red-500">*</span>
            </label>
            <input
              id="shipping-address"
              type="text"
              name="address"
              required
              minLength={5}
              maxLength={500}
              className="input"
              placeholder="Số nhà, tên đường, phường/xã..."
            />
          </div>

          <div className="md:col-span-2">
            <label htmlFor="order-note" className="block text-sm font-medium text-gray-700 mb-2">
              Ghi chú
            </label>
            <textarea
              id="order-note"
              name="note"
              rows={3}
              maxLength={500}
              className="input resize-none"
              placeholder="Ghi chú cho đơn hàng (nếu có)..."
            />
          </div>
        </div>
      </div>

      {/* Payment Method */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <h2 className="font-serif text-xl font-semibold text-primary mb-6 flex items-center gap-3">
          <span className="w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center text-sm">
            3
          </span>
          Phương Thức Thanh Toán
        </h2>

        <div className="space-y-4">
          <div className="p-4 border border-primary bg-primary/5 rounded-xl">
            <div className="flex items-start gap-3">
              <input
                aria-label="Đặt trước qua chuyển khoản ngân hàng"
                type="radio"
                name="payment"
                value="bank"
                checked
                readOnly
                className="mt-1"
              />
              <div>
                <div className="flex items-center gap-2">
                  <p className="font-medium text-primary">
                    Đặt trước qua chuyển khoản ngân hàng
                  </p>
                  <span
                    className="inline-flex"
                    title="Bạn có thể chuyển khoản ngay bằng thông tin bên dưới, hoặc chờ mình liên hệ xác nhận đơn rồi hướng dẫn chuyển khoản."
                  >
                    <Info className="w-4 h-4 text-accent" aria-hidden="true" />
                  </span>
                </div>
                <p className="text-sm text-gray-600">
                  Sau khi bạn gửi thông tin đặt sách, mình sẽ liên hệ xác nhận
                  đơn và hướng dẫn chuyển khoản.
                </p>
              </div>
            </div>
          </div>

          <div className="p-4 bg-secondary rounded-xl">
            <p className="text-sm font-medium text-primary mb-2">
              Thông tin chuyển khoản:
            </p>
            <div className="text-sm text-gray-600 space-y-1">
              <p>
                Ngân hàng: <span className="font-medium">{bankInfo.name}</span>
              </p>
              <p>
                Số TK:{" "}
                <span className="font-medium font-mono">
                  {bankInfo.account}
                </span>
              </p>
              <p>
                Chủ TK: <span className="font-medium">{bankInfo.holder}</span>
              </p>
              {bankInfo.branch && (
                <p>
                  Chi nhánh:{" "}
                  <span className="font-medium">{bankInfo.branch}</span>
                </p>
              )}
              <p className="text-xs text-gray-600 mt-2">
                * Bạn có thể chuyển khoản ngay nếu muốn; mã QR và nội dung CK
                chính xác sẽ hiển thị ở trang xác nhận sau khi đặt hàng.
              </p>
            </div>
          </div>
        </div>
      </div>

      {error && (
        <div
          role="alert"
          className="p-4 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700"
        >
          {error}
        </div>
      )}

      {disabled && (
        <div
          role="alert"
          className="p-4 bg-amber-50 border border-amber-200 rounded-xl text-sm text-amber-800"
        >
          Sách hiện đã hết hàng. Vui lòng quay lại sau.
        </div>
      )}

      <button
        type="submit"
        disabled={isSubmitting || disabled}
        className="w-full btn btn-primary py-4 text-lg disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isSubmitting ? (
          <span className="flex items-center justify-center gap-2">
            <svg
              className="animate-spin h-5 w-5"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
            Đang xử lý...
          </span>
        ) : (
          "Đặt Hàng"
        )}
      </button>

      <p className="text-center text-sm text-gray-600">
        Bằng việc đặt hàng, bạn đồng ý với{" "}
        <a href="#" className="text-primary underline decoration-primary/40 underline-offset-2 hover:decoration-primary">
          điều khoản dịch vụ
        </a>{" "}
        của chúng tôi.
      </p>
    </form>
  );
}
