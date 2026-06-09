/**
 * Pure currency formatting and parsing helpers.
 *
 * Formatting is implemented by hand (rather than via `Intl`) so the output is
 * deterministic and locale-independent, which keeps it predictable to test.
 */

/** Supported reporting currencies. */
export type Currency = "GBP" | "USD" | "EUR";

const CURRENCY_SYMBOLS: Record<Currency, string> = {
  GBP: "£",
  USD: "$",
  EUR: "€",
};

/** Return the symbol for a currency (e.g. "GBP" -> "£"). */
export function getCurrencySymbol(currency: Currency): string {
  return CURRENCY_SYMBOLS[currency];
}

/**
 * Format an amount as a currency string with thousands separators and two
 * decimal places, e.g. `formatCurrency(1234.5, "GBP")` -> `"£1,234.50"`.
 * Negative amounts place the minus sign before the symbol: `"-£1,234.50"`.
 */
export function formatCurrency(amount: number, currency: Currency): string {
  const symbol = getCurrencySymbol(currency);
  const safe = Number.isFinite(amount) ? amount : 0;
  const negative = safe < 0;

  const [intPart, decPart] = Math.abs(safe).toFixed(2).split(".");
  const withSeparators = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, ",");

  return `${negative ? "-" : ""}${symbol}${withSeparators}.${decPart}`;
}

/**
 * Parse free-form currency input into a number, stripping symbols, thousands
 * separators, and surrounding whitespace. Returns 0 for input that contains no
 * parseable number, e.g. `parseCurrencyInput("£1,234.50")` -> `1234.5`.
 */
export function parseCurrencyInput(input: string): number {
  const cleaned = input.replace(/[^0-9.-]/g, "");
  const value = Number.parseFloat(cleaned);
  return Number.isNaN(value) ? 0 : value;
}
