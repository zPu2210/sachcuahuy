# Sách Của Huy

Production Next.js website for selling Trọng Huy's books.

## Stack

- Next.js App Router
- Directus CMS at `https://cms.sachcuahuy.com`
- Vercel production at `https://sachcuahuy.com`

## Core Flows

- Catalog pages read published books and site settings from Directus.
- Checkout posts to `/api/orders`.
- Orders are written server-side with `DIRECTUS_API_ORDERS_TOKEN`.
- Confirmation pages use `/xac-nhan/[token]` and phone-last-4 verification before revealing delivery details.

## Required Environment Variables

See `.env.example`.

- `DIRECTUS_URL`
- `DIRECTUS_API_ORDERS_TOKEN`
- `NEXT_PUBLIC_DIRECTUS_ASSETS_URL`
- `COOKIE_SECRET`
- `REVALIDATE_SECRET`
- `NEXT_PUBLIC_SITE_URL`

## Local Commands

```bash
npm run lint
npm run build
npm run dev
```

## QA Notes

Production checkout smoke tests create real Directus orders and may trigger notification flows. Prefix QA customer names and notes clearly, record generated order codes, and delete test orders from Directus after verification.
