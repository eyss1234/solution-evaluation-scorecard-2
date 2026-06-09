"use client";

import { useState } from "react";
import type { Currency } from "@/domain/financial/format";

const CURRENCIES: { code: Currency; label: string }[] = [
  { code: "GBP", label: "GBP £" },
  { code: "USD", label: "USD $" },
  { code: "EUR", label: "EUR €" },
];

interface CurrencySelectorProps {
  projectId: string;
  value: Currency;
  onChange: (currency: Currency) => void;
}

/** Project reporting-currency dropdown; persists via the financial currency API. */
export function CurrencySelector({
  projectId,
  value,
  onChange,
}: CurrencySelectorProps) {
  const [saving, setSaving] = useState(false);

  async function handleChange(event: React.ChangeEvent<HTMLSelectElement>) {
    const next = event.target.value as Currency;
    const previous = value;
    onChange(next); // optimistic
    setSaving(true);
    try {
      const res = await fetch(`/api/projects/${projectId}/financial/currency`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currency: next }),
      });
      const json = await res.json();
      if (!res.ok || !json.ok) onChange(previous); // revert
    } catch {
      onChange(previous);
    } finally {
      setSaving(false);
    }
  }

  return (
    <select
      value={value}
      onChange={handleChange}
      disabled={saving}
      aria-label="Reporting currency"
      className="input w-auto py-1.5 text-sm disabled:opacity-60"
    >
      {CURRENCIES.map((c) => (
        <option key={c.code} value={c.code}>
          {c.label}
        </option>
      ))}
    </select>
  );
}
