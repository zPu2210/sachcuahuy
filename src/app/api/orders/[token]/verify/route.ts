import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { readItems, updateItem } from "@directus/sdk";
import { directusOrders } from "@/lib/directus";
import {
  isValidOrderToken,
  signPiiCookie,
  verifyPhoneLast4,
  PII_COOKIE_MAX_AGE_SECONDS,
  VERIFY_LOCK_THRESHOLD,
  VERIFY_LOCK_DURATION_MS,
} from "@/lib/order";
import type { Order } from "@/lib/types-directus";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const VerifySchema = z.object({
  phone_last_4: z.string().regex(/^[0-9]{4}$/),
});

interface RouteContext {
  params: Promise<{ token: string }>;
}

async function fetchOrderForVerify(
  token: string,
): Promise<Pick<
  Order,
  "id" | "customer_phone" | "verify_attempts" | "verify_locked_until"
> | null> {
  const result = (await directusOrders.request(
    readItems("orders", {
      filter: { order_token: { _eq: token } },
      limit: 1,
      fields: [
        "id",
        "customer_phone",
        "verify_attempts",
        "verify_locked_until",
      ],
    }),
  )) as Pick<
    Order,
    "id" | "customer_phone" | "verify_attempts" | "verify_locked_until"
  >[];
  return result[0] ?? null;
}

export async function POST(req: NextRequest, ctx: RouteContext) {
  try {
    const { token } = await ctx.params;
    if (!isValidOrderToken(token)) {
      return NextResponse.json({ error: "invalid_token" }, { status: 404 });
    }

    const body = await req.json();
    const { phone_last_4 } = VerifySchema.parse(body);

    const order = await fetchOrderForVerify(token);
    if (!order) {
      return NextResponse.json({ error: "not_found" }, { status: 404 });
    }

    const now = new Date();
    const lockedUntil = order.verify_locked_until
      ? new Date(order.verify_locked_until)
      : null;
    const lockActive = !!(lockedUntil && lockedUntil > now);
    const lockExpired = !!(lockedUntil && lockedUntil <= now);

    if (lockActive) {
      return NextResponse.json(
        {
          error: "locked",
          locked_until: lockedUntil!.toISOString(),
        },
        { status: 423 },
      );
    }

    // Reset stale counter when an earlier lock has expired — gives genuine
    // users a fresh 5-attempt window after waiting out the lock instead of
    // re-locking on the very next wrong attempt.
    const baseAttempts = lockExpired ? 0 : order.verify_attempts ?? 0;

    const match = verifyPhoneLast4(order.customer_phone, phone_last_4);
    const nowIso = now.toISOString();

    if (match) {
      await directusOrders.request(
        updateItem("orders", order.id, {
          verify_attempts: 0,
          verify_locked_until: null,
          verify_last_attempt_at: nowIso,
        }),
      );

      const response = NextResponse.json({ ok: true });
      response.cookies.set(`pii-${token}`, signPiiCookie(token), {
        httpOnly: true,
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
        maxAge: PII_COOKIE_MAX_AGE_SECONDS,
        path: `/xac-nhan/${token}`,
      });
      return response;
    }

    const newAttempts = baseAttempts + 1;
    const reachedLimit = newAttempts >= VERIFY_LOCK_THRESHOLD;
    const newLockedUntil = reachedLimit
      ? new Date(now.getTime() + VERIFY_LOCK_DURATION_MS).toISOString()
      : null;

    await directusOrders.request(
      updateItem("orders", order.id, {
        verify_attempts: newAttempts,
        verify_last_attempt_at: nowIso,
        // Always overwrite verify_locked_until — clears stale expired lock when
        // not re-locking, sets new window when threshold reached.
        verify_locked_until: newLockedUntil,
      }),
    );

    if (reachedLimit) {
      return NextResponse.json(
        {
          error: "locked",
          locked_until: newLockedUntil,
        },
        { status: 423 },
      );
    }

    return NextResponse.json(
      { error: "wrong_phone", attempts: newAttempts, max: VERIFY_LOCK_THRESHOLD },
      { status: 401 },
    );
  } catch (e: unknown) {
    if (e instanceof z.ZodError) {
      return NextResponse.json(
        { error: "invalid_input", issues: e.issues },
        { status: 400 },
      );
    }
    console.error("[orders.verify]", e instanceof Error ? e.message : e);
    return NextResponse.json({ error: "server_error" }, { status: 500 });
  }
}
