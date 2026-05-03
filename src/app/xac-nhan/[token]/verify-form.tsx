"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface VerifyFormProps {
  token: string;
}

export function VerifyForm({ token }: VerifyFormProps) {
  const router = useRouter();
  const [value, setValue] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!/^[0-9]{4}$/.test(value)) {
      setError("Vui lòng nhập đúng 4 chữ số cuối SĐT.");
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch(`/api/orders/${token}/verify`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone_last_4: value }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok) {
        router.refresh();
        return;
      }
      if (res.status === 423 && data?.locked_until) {
        const until = new Date(data.locked_until).toLocaleString("vi-VN");
        setError(`Đã khoá xác minh đến ${until}. Vui lòng thử lại sau.`);
      } else if (res.status === 401) {
        const left =
          typeof data?.attempts === "number" && typeof data?.max === "number"
            ? Math.max(0, data.max - data.attempts)
            : null;
        setError(
          left !== null
            ? `Sai 4 số cuối SĐT. Còn ${left} lần thử.`
            : "Sai 4 số cuối SĐT.",
        );
      } else {
        setError("Có lỗi xảy ra. Vui lòng thử lại.");
      }
    } catch {
      setError("Không kết nối được máy chủ. Vui lòng thử lại.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <p className="text-sm text-gray-600">
        Để xem địa chỉ giao hàng và thông tin liên hệ, vui lòng nhập{" "}
        <span className="font-medium">4 số cuối</span> số điện thoại đã đặt hàng.
      </p>
      <div>
        <label
          htmlFor="phone_last_4"
          className="block text-sm font-medium text-gray-700 mb-2"
        >
          4 số cuối SĐT
        </label>
        <input
          id="phone_last_4"
          name="phone_last_4"
          type="text"
          inputMode="numeric"
          pattern="[0-9]{4}"
          maxLength={4}
          autoComplete="off"
          required
          value={value}
          onChange={(e) => setValue(e.target.value.replace(/[^0-9]/g, "").slice(0, 4))}
          className="input w-32 text-center font-mono tracking-widest text-lg"
          placeholder="••••"
        />
      </div>
      {error && (
        <p className="text-sm text-red-600" role="alert">
          {error}
        </p>
      )}
      <button
        type="submit"
        disabled={submitting || value.length !== 4}
        className="btn btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {submitting ? "Đang xác minh..." : "Xác Minh"}
      </button>
    </form>
  );
}
