export const PROJECT_TYPE_CONFIG = {
  ecommerce: { label: "E-Commerce" },
  landing_page: { label: "Landing Page" },
  erp: { label: "ERP System" },
  mobile_app: { label: "Mobile App" },
  custom: { label: "Custom Software" },
} as const

export function getProjectTypeLabel(type: string): string {
  const normalized = type.toLowerCase() as keyof typeof PROJECT_TYPE_CONFIG
  return PROJECT_TYPE_CONFIG[normalized]?.label ?? type
}
