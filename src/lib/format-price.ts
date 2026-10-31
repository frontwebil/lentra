const currencySymbols: Record<string, string> = {
  UAH: "₴",
  USD: "$",
  EUR: "€",
  PLN: "zł",
  GBP: "£",
};

export function formatPrice(value: number, currency = "UAH", language: "uk" | "en" = "uk") {
  const amount = new Intl.NumberFormat(language === "en" ? "en-GB" : "uk-UA", {
    maximumFractionDigits: 2,
  }).format(value);
  return `${amount} ${currencySymbols[currency] ?? currency}`;
}
