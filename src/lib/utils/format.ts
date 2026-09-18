/**
 * Formatting helpers.
 *
 * `Intl` formatters are expensive to construct, so they are cached per locale
 * and currency - these run on every product card, in tight loops.
 */

const currencyFormatters = new Map<string, Intl.NumberFormat>();

export function formatCurrency(value: number, currency = "USD", locale = "en-US") {
  const key = `${locale}:${currency}`;
  let formatter = currencyFormatters.get(key);
  if (!formatter) {
    formatter = new Intl.NumberFormat(locale, {
      style: "currency",
      currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
    currencyFormatters.set(key, formatter);
  }
  return formatter.format(value);
}

const compactFormatter = new Intl.NumberFormat("en-US", { notation: "compact", maximumFractionDigits: 1 });

export function formatCompact(value: number) {
  return compactFormatter.format(value);
}

const dateFormatter = new Intl.DateTimeFormat("en-US", { day: "numeric", month: "short", year: "numeric" });

export function formatDate(iso: string) {
  const parsed = Date.parse(iso);
  return Number.isNaN(parsed) ? "" : dateFormatter.format(parsed);
}

/** "3 days ago" style label used on reviews. */
export function formatRelativeDate(iso: string, now = Date.now()) {
  const parsed = Date.parse(iso);
  if (Number.isNaN(parsed)) return "";
  const days = Math.round((now - parsed) / 86400000);
  if (days < 1) return "Today";
  if (days === 1) return "Yesterday";
  if (days < 30) return `${days} days ago`;
  const months = Math.round(days / 30);
  if (months < 12) return `${months} month${months === 1 ? "" : "s"} ago`;
  const years = Math.round(months / 12);
  return `${years} year${years === 1 ? "" : "s"} ago`;
}

export function roundMoney(value: number) {
  return Math.round(value * 100) / 100;
}

export function titleCase(value: string) {
  return value
    .split(/[-\s]+/)
    .filter(Boolean)
    .map((word) => word[0].toUpperCase() + word.slice(1))
    .join(" ");
}

export function truncate(value: string, max: number) {
  return value.length <= max ? value : `${value.slice(0, max - 1).trimEnd()}...`;
}
