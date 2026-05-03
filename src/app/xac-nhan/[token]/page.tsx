import { notFound } from "next/navigation";
import { cookies } from "next/headers";
import Link from "next/link";
import type { Metadata } from "next";
import { readItems } from "@directus/sdk";
import { directusOrders } from "@/lib/directus";
import { getSiteSettings } from "@/lib/site-config";
import { formatPrice } from "@/lib/books";
import {
  buildMemo,
  isValidOrderToken,
  verifyPiiCookie,
} from "@/lib/order";
import { buildVietQRUrl } from "@/lib/vietqr";
import type { Order } from "@/lib/types-directus";
import { VerifyForm } from "./verify-form";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Xác Nhận Đơn Hàng - Sách Của Huy",
  robots: { index: false, follow: false },
};

interface PageProps {
  params: Promise<{ token: string }>;
}

// Fields safe to render in unverified state — passed to JSX so they end up
// in the RSC payload that React serializes into HTML for hydration.
// PII (name, phone, email, address, district, city, note) is excluded.
const SAFE_RENDER_FIELDS = [
  "id",
  "order_code",
  "order_token",
  "items",
  "subtotal",
  "shipping_fee",
  "total",
  "payment_method",
  "payment_status",
  "order_status",
] as const;

// Fields fetched server-side ALWAYS — name + phone are needed only for
// memo construction (when memo_format references {name} or {phone}).
// They are NEVER passed to JSX in unverified state.
const SERVER_ONLY_FIELDS = ["customer_name", "customer_phone"] as const;

const VERIFIED_EXTRA_FIELDS = [
  "customer_email",
  "shipping_city",
  "shipping_district",
  "shipping_address",
  "note",
] as const;

type SafeRenderOrder = Pick<Order, (typeof SAFE_RENDER_FIELDS)[number]>;

async function fetchOrder(
  token: string,
  verified: boolean,
): Promise<Order | null> {
  const fields = verified
    ? [
        ...SAFE_RENDER_FIELDS,
        ...SERVER_ONLY_FIELDS,
        ...VERIFIED_EXTRA_FIELDS,
      ]
    : [...SAFE_RENDER_FIELDS, ...SERVER_ONLY_FIELDS];
  const result = (await directusOrders.request(
    readItems("orders", {
      filter: { order_token: { _eq: token } },
      limit: 1,
      fields,
    }),
  )) as Order[];
  return result[0] ?? null;
}

function toSafeRenderOrder(o: Order): SafeRenderOrder {
  return {
    id: o.id,
    order_code: o.order_code,
    order_token: o.order_token,
    items: o.items,
    subtotal: o.subtotal,
    shipping_fee: o.shipping_fee,
    total: o.total,
    payment_method: o.payment_method,
    payment_status: o.payment_status,
    order_status: o.order_status,
  };
}

function isFullOrder(o: Order | SafeRenderOrder): o is Order {
  return "shipping_address" in o;
}

function StatusBadge({
  label,
  variant,
}: {
  label: string;
  variant: "info" | "warn" | "ok" | "muted";
}) {
  const styles: Record<typeof variant, string> = {
    info: "bg-blue-50 text-blue-700 border-blue-200",
    warn: "bg-amber-50 text-amber-700 border-amber-200",
    ok: "bg-green-50 text-green-700 border-green-200",
    muted: "bg-gray-50 text-gray-700 border-gray-200",
  };
  return (
    <span
      className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${styles[variant]}`}
    >
      {label}
    </span>
  );
}

function paymentBadge(status: Order["payment_status"]) {
  const map: Record<Order["payment_status"], { label: string; variant: "info" | "warn" | "ok" | "muted" }> = {
    pending: { label: "Chờ thanh toán", variant: "warn" },
    paid: { label: "Đã thanh toán", variant: "ok" },
    failed: { label: "Thanh toán lỗi", variant: "muted" },
    refunded: { label: "Đã hoàn tiền", variant: "muted" },
  };
  const cfg = map[status];
  return <StatusBadge label={cfg.label} variant={cfg.variant} />;
}

function orderStatusBadge(status: Order["order_status"]) {
  const map: Record<Order["order_status"], { label: string; variant: "info" | "warn" | "ok" | "muted" }> = {
    new: { label: "Mới tạo", variant: "info" },
    confirmed: { label: "Đã xác nhận", variant: "info" },
    shipped: { label: "Đang giao", variant: "info" },
    delivered: { label: "Đã giao", variant: "ok" },
    cancelled: { label: "Đã huỷ", variant: "muted" },
  };
  const cfg = map[status];
  return <StatusBadge label={cfg.label} variant={cfg.variant} />;
}

export default async function ConfirmationPage({ params }: PageProps) {
  const { token } = await params;

  if (!isValidOrderToken(token)) {
    notFound();
  }

  const cookieStore = await cookies();
  const sig = cookieStore.get(`pii-${token}`)?.value;
  const verified = !!sig && verifyPiiCookie(token, sig);

  const raw = await fetchOrder(token, verified);
  if (!raw) {
    notFound();
  }

  // Pass only safe fields to JSX in unverified state — server-only fields
  // (customer_name, customer_phone) used below for memo construction never
  // reach the RSC payload.
  const order: Order | SafeRenderOrder = verified ? raw : toSafeRenderOrder(raw);

  let qrUrl: string | null = null;
  let bankInfo: {
    name: string;
    account: string;
    holder: string;
    branch: string | null;
    memo: string;
  } | null = null;

  if (raw.payment_method === "bank") {
    const settings = await getSiteSettings();
    const memo = buildMemo(
      {
        name: raw.customer_name,
        phone: raw.customer_phone,
        order_code: raw.order_code,
      },
      settings.memo_format,
    );
    qrUrl = buildVietQRUrl({
      bank: settings.bank_name,
      account: settings.bank_account,
      amount: raw.total,
      memo,
      accountName: settings.bank_holder,
    });
    bankInfo = {
      name: settings.bank_name,
      account: settings.bank_account,
      holder: settings.bank_holder,
      branch: settings.bank_branch ?? null,
      memo,
    };
  }

  return (
    <div className="min-h-screen bg-secondary py-12">
      <div className="container-custom max-w-3xl">
        <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 mb-6">
          <h1 className="font-serif text-3xl font-semibold text-primary mb-2">
            Xác Nhận Đơn Hàng
          </h1>
          <p className="text-gray-600">
            Cảm ơn bạn đã đặt hàng. Mã đơn:{" "}
            <span className="font-mono font-semibold text-primary">
              {order.order_code}
            </span>
          </p>
          <div className="flex flex-wrap gap-2 mt-4">
            {orderStatusBadge(order.order_status)}
            {paymentBadge(order.payment_status)}
          </div>
        </div>

        {order.payment_method === "bank" && qrUrl && bankInfo && (
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mb-6">
            <h2 className="font-serif text-xl font-semibold text-primary mb-4">
              Thanh Toán Chuyển Khoản
            </h2>
            <div className="grid md:grid-cols-2 gap-6 items-start">
              <div className="flex justify-center">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={qrUrl}
                  alt={`Mã QR chuyển khoản ${bankInfo.name} ${bankInfo.account}`}
                  className="w-full max-w-xs rounded-lg border border-gray-100"
                  loading="eager"
                />
              </div>
              <div className="space-y-3 text-sm">
                <div>
                  <span className="text-gray-500">Ngân hàng:</span>{" "}
                  <span className="font-medium">{bankInfo.name}</span>
                </div>
                <div>
                  <span className="text-gray-500">Số tài khoản:</span>{" "}
                  <span className="font-mono font-medium">{bankInfo.account}</span>
                </div>
                <div>
                  <span className="text-gray-500">Chủ tài khoản:</span>{" "}
                  <span className="font-medium">{bankInfo.holder}</span>
                </div>
                {bankInfo.branch && (
                  <div>
                    <span className="text-gray-500">Chi nhánh:</span>{" "}
                    <span className="font-medium">{bankInfo.branch}</span>
                  </div>
                )}
                <div>
                  <span className="text-gray-500">Số tiền:</span>{" "}
                  <span className="font-semibold text-accent">
                    {formatPrice(order.total)}
                  </span>
                </div>
                <div>
                  <span className="text-gray-500">Nội dung CK:</span>
                  <div className="font-mono mt-1 p-2 bg-gray-50 rounded text-xs break-all">
                    {bankInfo.memo}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {order.payment_method === "cod" && (
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mb-6">
            <h2 className="font-serif text-xl font-semibold text-primary mb-2">
              Thanh Toán Khi Nhận Hàng (COD)
            </h2>
            <p className="text-gray-600 text-sm">
              Vui lòng thanh toán {formatPrice(order.total)} cho shipper khi nhận sách.
            </p>
          </div>
        )}

        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mb-6">
          <h2 className="font-serif text-xl font-semibold text-primary mb-4">
            Sản Phẩm
          </h2>
          <div className="divide-y divide-gray-100">
            {order.items.map((item, idx) => (
              <div key={idx} className="py-3 flex justify-between text-sm">
                <div>
                  <p className="font-medium text-primary">{item.title}</p>
                  <p className="text-gray-500 text-xs">x{item.qty}</p>
                </div>
                <span className="font-medium">
                  {formatPrice(item.price * item.qty)}
                </span>
              </div>
            ))}
          </div>
          <div className="mt-4 pt-4 border-t border-gray-100 space-y-2 text-sm">
            <div className="flex justify-between text-gray-600">
              <span>Tạm tính</span>
              <span>{formatPrice(order.subtotal)}</span>
            </div>
            <div className="flex justify-between text-gray-600">
              <span>Phí ship</span>
              <span>
                {order.shipping_fee === 0 ? (
                  <span className="text-green-600">Miễn phí</span>
                ) : (
                  formatPrice(order.shipping_fee)
                )}
              </span>
            </div>
            <div className="flex justify-between font-semibold text-primary pt-2 border-t border-gray-100">
              <span>Tổng cộng</span>
              <span className="text-lg text-accent">{formatPrice(order.total)}</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mb-6">
          <h2 className="font-serif text-xl font-semibold text-primary mb-4">
            Thông Tin Giao Hàng
          </h2>
          {verified && isFullOrder(order) ? (
            <div className="space-y-3 text-sm">
              <div>
                <span className="text-gray-500">Người nhận:</span>{" "}
                <span className="font-medium">{order.customer_name}</span>
              </div>
              <div>
                <span className="text-gray-500">Số điện thoại:</span>{" "}
                <span className="font-medium font-mono">
                  {order.customer_phone}
                </span>
              </div>
              {order.customer_email && (
                <div>
                  <span className="text-gray-500">Email:</span>{" "}
                  <span className="font-medium">{order.customer_email}</span>
                </div>
              )}
              <div>
                <span className="text-gray-500">Địa chỉ:</span>{" "}
                <span className="font-medium">
                  {order.shipping_address}, {order.shipping_district},{" "}
                  {order.shipping_city.toUpperCase()}
                </span>
              </div>
              {order.note && (
                <div>
                  <span className="text-gray-500">Ghi chú:</span>{" "}
                  <span>{order.note}</span>
                </div>
              )}
            </div>
          ) : (
            <VerifyForm token={token} />
          )}
        </div>

        <div className="text-center">
          <Link
            href="/sach"
            className="text-sm text-gray-500 hover:text-primary transition-colors"
          >
            ← Tiếp tục mua sách
          </Link>
        </div>
      </div>
    </div>
  );
}
