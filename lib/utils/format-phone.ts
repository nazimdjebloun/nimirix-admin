export function formatPhone(phone: string): string {
  const digits = phone.replace(/\D/g, "").replace(/^213/, "0");
  return digits.replace(/(\d{2})(?=\d)/g, "$1 ").trim();
}