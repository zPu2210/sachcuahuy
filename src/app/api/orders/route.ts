import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createItem, readItems } from "@directus/sdk";
import {
  assertDirectusOrdersConfigured,
  directusErrorMessage,
  directusOrders,
} from "@/lib/directus";
import { getSiteSettings } from "@/lib/site-config";
import { getBookBySlug } from "@/lib/books";
import {
  bankMemo,
  calcShipping,
  generateOrderCode,
  generateOrderToken,
} from "@/lib/order";
import { buildVietQRUrl } from "@/lib/vietqr";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const OrderSchema = z.object({
  customer_name: z.string().min(2).max(100),
  customer_phone: z.string().regex(/^0[0-9]{9,10}$/, "Số điện thoại không hợp lệ"),
  customer_email: z.union([z.string().email(), z.literal("")]).optional(),
  shipping_city: z.string().min(1).max(50),
  shipping_district: z.string().min(1).max(100),
  shipping_address: z.string().min(5).max(500),
  note: z.string().max(500).optional(),
  payment_method: z.literal("bank"),
  items: z
    .array(
      z.object({
        slug: z.string().min(1).max(100),
        qty: z.number().int().min(1).max(10),
      }),
    )
    .min(1)
    .max(20),
});

async function generateUniqueToken(maxAttempts = 5): Promise<string> {
  for (let i = 0; i < maxAttempts; i++) {
    const token = generateOrderToken();
    const existing = (await directusOrders.request(
      readItems("orders", {
        filter: { order_token: { _eq: token } },
        limit: 1,
        fields: ["id"],
      }),
    )) as { id: number }[];
    if (existing.length === 0) return token;
  }
  throw new Error("token_collision_max_retries");
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = OrderSchema.parse(body);
    assertDirectusOrdersConfigured();

    const settings = await getSiteSettings();

    // Resolve book prices server-side (anti price-tampering).
    const itemsResolved = await Promise.all(
      parsed.items.map(async (i) => {
        const book = await getBookBySlug(i.slug);
        if (!book) {
          throw new Error(`book_not_found:${i.slug}`);
        }
        if (book.stock_status === "out_of_stock") {
          throw new Error(`out_of_stock:${i.slug}`);
        }
        return {
          book_id: book.id,
          slug: book.slug,
          title: book.title,
          qty: i.qty,
          price: book.price,
        };
      }),
    );

    const subtotal = itemsResolved.reduce((s, i) => s + i.price * i.qty, 0);
    const shipping_fee = calcShipping(parsed.shipping_city, settings);
    const total = subtotal + shipping_fee;
    const order_code = generateOrderCode();
    const order_token = await generateUniqueToken();

    await directusOrders.request(
      createItem("orders", {
        order_code,
        order_token,
        customer_name: parsed.customer_name,
        customer_phone: parsed.customer_phone,
        customer_email: parsed.customer_email || null,
        shipping_city: parsed.shipping_city,
        shipping_district: parsed.shipping_district,
        shipping_address: parsed.shipping_address,
        note: parsed.note || null,
        items: itemsResolved,
        subtotal,
        shipping_fee,
        total,
        payment_method: parsed.payment_method,
        payment_status: "pending",
        order_status: "new",
        notification_status: "pending",
        verify_attempts: 0,
      }),
    );

    const memo = bankMemo(order_code);
    const qr_url =
      parsed.payment_method === "bank"
        ? buildVietQRUrl({
            bank: settings.bank_name,
            account: settings.bank_account,
            amount: total,
            memo,
            accountName: settings.bank_holder,
          })
        : null;

    return NextResponse.json({
      order_token,
      order_code,
      total,
      qr_url,
      confirmation_url: `/xac-nhan/${order_token}`,
      bank:
        parsed.payment_method === "bank"
          ? {
              name: settings.bank_name,
              account: settings.bank_account,
              holder: settings.bank_holder,
              branch: settings.bank_branch ?? null,
              memo,
            }
          : null,
    });
  } catch (e: unknown) {
    if (e instanceof z.ZodError) {
      return NextResponse.json(
        { error: "invalid_input", issues: e.issues },
        { status: 400 },
      );
    }
    const msg = directusErrorMessage(e);
    if (msg.startsWith("out_of_stock:")) {
      return NextResponse.json({ error: "out_of_stock", slug: msg.slice("out_of_stock:".length) }, { status: 409 });
    }
    if (msg.startsWith("book_not_found:")) {
      return NextResponse.json({ error: "book_not_found", slug: msg.slice("book_not_found:".length) }, { status: 404 });
    }
    console.error("[orders.create]", msg);
    return NextResponse.json({ error: "server_error" }, { status: 500 });
  }
}
