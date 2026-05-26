export function formatCurrency(amount: number, currency: string = "DZD"): string {
  try {
    const symbolMap: Record<string, string> = {
      USD: "$",
      EUR: "€",
      DZD: "DA",
    }
    const symbol = symbolMap[currency.toUpperCase()] || currency
    return `${new Intl.NumberFormat().format(amount)} ${symbol}`
  } catch {
    return `${amount} ${currency}`
  }
}
