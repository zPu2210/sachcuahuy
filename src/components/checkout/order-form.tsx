"use client";

import { useState } from "react";
import { Check } from "lucide-react";

export function OrderForm() {
  const [paymentMethod, setPaymentMethod] = useState<"cod" | "bank">("cod");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500));

    setIsSubmitting(false);
    setIsSubmitted(true);
  };

  if (isSubmitted) {
    return (
      <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 text-center">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <Check className="w-8 h-8 text-green-600" />
        </div>
        <h2 className="font-serif text-2xl font-semibold text-primary mb-4">
          Đặt Hàng Thành Công!
        </h2>
        <p className="text-gray-600 mb-6">
          Cảm ơn bạn đã đặt hàng tại Sách Của Huy.
          <br />
          Chúng tôi sẽ liên hệ xác nhận qua điện thoại trong thời gian sớm nhất.
        </p>
        <p className="text-sm text-gray-500">
          Mã đơn hàng: <span className="font-mono font-semibold">#SCH-{Date.now().toString().slice(-8)}</span>
        </p>
      </div>
    );
  }

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
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Họ và tên <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="name"
              required
              className="input"
              placeholder="Nguyễn Văn A"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Số điện thoại <span className="text-red-500">*</span>
            </label>
            <input
              type="tel"
              name="phone"
              required
              className="input"
              placeholder="0912 345 678"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email
            </label>
            <input
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
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tỉnh/Thành phố <span className="text-red-500">*</span>
            </label>
            <select name="city" required className="input">
              <option value="">Chọn tỉnh/thành phố</option>
              <option value="hcm">TP. Hồ Chí Minh</option>
              <option value="hn">Hà Nội</option>
              <option value="dn">Đà Nẵng</option>
              <option value="other">Tỉnh/Thành khác</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Quận/Huyện <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="district"
              required
              className="input"
              placeholder="Quận/Huyện"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Địa chỉ chi tiết <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="address"
              required
              className="input"
              placeholder="Số nhà, tên đường, phường/xã..."
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Ghi chú
            </label>
            <textarea
              name="note"
              rows={3}
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
          {/* COD */}
          <label
            className={`flex items-start gap-4 p-4 border rounded-xl cursor-pointer transition-colors ${
              paymentMethod === "cod"
                ? "border-primary bg-primary/5"
                : "border-gray-200 hover:border-gray-300"
            }`}
          >
            <input
              type="radio"
              name="payment"
              value="cod"
              checked={paymentMethod === "cod"}
              onChange={() => setPaymentMethod("cod")}
              className="mt-1"
            />
            <div>
              <p className="font-medium text-primary">
                Thanh toán khi nhận hàng (COD)
              </p>
              <p className="text-sm text-gray-500">
                Thanh toán tiền mặt cho shipper khi nhận sách
              </p>
            </div>
          </label>

          {/* Bank Transfer */}
          <label
            className={`flex items-start gap-4 p-4 border rounded-xl cursor-pointer transition-colors ${
              paymentMethod === "bank"
                ? "border-primary bg-primary/5"
                : "border-gray-200 hover:border-gray-300"
            }`}
          >
            <input
              type="radio"
              name="payment"
              value="bank"
              checked={paymentMethod === "bank"}
              onChange={() => setPaymentMethod("bank")}
              className="mt-1"
            />
            <div>
              <p className="font-medium text-primary">Chuyển khoản ngân hàng</p>
              <p className="text-sm text-gray-500">
                Quét mã QR hoặc chuyển khoản trực tiếp
              </p>
            </div>
          </label>

          {/* Bank details if selected */}
          {paymentMethod === "bank" && (
            <div className="ml-8 p-4 bg-secondary rounded-xl">
              <p className="text-sm font-medium text-primary mb-2">
                Thông tin chuyển khoản:
              </p>
              <div className="text-sm text-gray-600 space-y-1">
                <p>
                  Ngân hàng: <span className="font-medium">VPBank</span>
                </p>
                <p>
                  Số TK: <span className="font-medium font-mono">123456789</span>
                </p>
                <p>
                  Chủ TK: <span className="font-medium">TRỌNG HUY</span>
                </p>
                <p className="text-xs text-gray-500 mt-2">
                  * Nội dung CK: [Họ tên] - [SĐT]
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={isSubmitting}
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

      <p className="text-center text-sm text-gray-500">
        Bằng việc đặt hàng, bạn đồng ý với{" "}
        <a href="#" className="text-primary hover:underline">
          điều khoản dịch vụ
        </a>{" "}
        của chúng tôi.
      </p>
    </form>
  );
}
