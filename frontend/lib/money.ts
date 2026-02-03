export type CurrencyCode = "NGN" | "USD" | "EUR";

export interface FxRateMap {
  [code: string]: number;
}

/**
 * Format a base amount (in minor units) into multiple currencies.
 *
 * In production this should be backed by a live FX source and
 * the users geo-IP, but here we keep a simple pluggable
 * interface so the UI can render NGN / USD / EUR side by side.
 */
export function formatMultiCurrency(
  baseMinor: number,
  baseCurrency: CurrencyCode,
  fx: FxRateMap
): { code: CurrencyCode; value: string }[] {
  const base = baseMinor / 100;

  const format = (code: CurrencyCode, amount: number) => {
    return new Intl.NumberFormat(undefined, {
      style: "currency",
      currency: code,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  const toCurrency = (target: CurrencyCode) => {
    if (target === baseCurrency) return base;
    const pair = `${baseCurrency}_${target}`;
    const rate = fx[pair];
    if (!rate) return base; // graceful fallback
    return base * rate;
  };

  const codes: CurrencyCode[] = ["NGN", "USD", "EUR"];

  return codes.map((code) => ({
    code,
    value: format(code, toCurrency(code)),
  }));
}
