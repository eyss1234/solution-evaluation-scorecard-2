import { describe, it, expect } from "vitest";
import {
  getCurrencySymbol,
  formatCurrency,
  parseCurrencyInput,
} from "./format";

describe("getCurrencySymbol", () => {
  it("maps each currency to its symbol", () => {
    expect(getCurrencySymbol("GBP")).toBe("£");
    expect(getCurrencySymbol("USD")).toBe("$");
    expect(getCurrencySymbol("EUR")).toBe("€");
  });
});

describe("formatCurrency", () => {
  it("formats with thousands separators and two decimals", () => {
    expect(formatCurrency(1234.5, "GBP")).toBe("£1,234.50");
    expect(formatCurrency(1000000, "USD")).toBe("$1,000,000.00");
    expect(formatCurrency(0, "EUR")).toBe("€0.00");
  });

  it("places the minus sign before the symbol for negatives", () => {
    expect(formatCurrency(-1234.5, "GBP")).toBe("-£1,234.50");
  });

  it("rounds to two decimal places", () => {
    expect(formatCurrency(1234.567, "USD")).toBe("$1,234.57");
  });

  it("falls back to zero for non-finite input", () => {
    expect(formatCurrency(Number.NaN, "GBP")).toBe("£0.00");
  });
});

describe("parseCurrencyInput", () => {
  it("strips symbols and separators", () => {
    expect(parseCurrencyInput("£1,234.50")).toBeCloseTo(1234.5);
    expect(parseCurrencyInput("$1,000")).toBe(1000);
  });

  it("returns 0 for input with no number", () => {
    expect(parseCurrencyInput("abc")).toBe(0);
    expect(parseCurrencyInput("")).toBe(0);
  });

  it("preserves negative values", () => {
    expect(parseCurrencyInput("-£500")).toBe(-500);
  });
});
