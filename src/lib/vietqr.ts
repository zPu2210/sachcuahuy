// VietQR.io image API: https://img.vietqr.io/image/{bank}-{account}-{template}.png
// Template "compact2" = compact card with bank logo + amount + memo.

export interface VietQRParams {
  bank: string;
  account: string;
  amount: number;
  memo: string;
  accountName: string;
}

export function buildVietQRUrl(p: VietQRParams): string {
  const base = `https://img.vietqr.io/image/${encodeURIComponent(
    p.bank.toLowerCase(),
  )}-${encodeURIComponent(p.account)}-compact2.png`;
  const qs = new URLSearchParams({
    amount: String(p.amount),
    addInfo: p.memo,
    accountName: p.accountName,
  });
  return `${base}?${qs.toString()}`;
}
