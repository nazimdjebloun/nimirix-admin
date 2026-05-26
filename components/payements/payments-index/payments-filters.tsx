"use client"

import { Search } from "lucide-react"
import { LimitSelector } from "@/components/shared/limit-selector"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import type { PaymentListFilter, PaymentListSort } from "./types"

interface PaymentsFiltersProps {
  search: string
  billingFilter: PaymentListFilter
  sortBy: PaymentListSort
  itemsPerPage: number
  onSearchChange: (value: string) => void
  onBillingFilterChange: (value: PaymentListFilter) => void
  onSortChange: (value: PaymentListSort) => void
  onItemsPerPageChange: (value: number) => void
}

export function PaymentsFilters({
  search,
  billingFilter,
  sortBy,
  itemsPerPage,
  onSearchChange,
  onBillingFilterChange,
  onSortChange,
  onItemsPerPageChange,
}: PaymentsFiltersProps) {
  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-border/50 bg-card/40 p-4 lg:flex-row lg:items-center">
      <div className="relative flex-1">
        <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground/60" />
        <Input
          value={search}
          onChange={(event) => onSearchChange(event.target.value)}
          placeholder="Search client, contact, or email"
          className="rounded-xl border-border/70 bg-card py-5 pr-4 pl-9"
        />
      </div>

      <Select
        value={billingFilter}
        onValueChange={(value) => onBillingFilterChange(value as PaymentListFilter)}
      >
        <SelectTrigger className="w-full rounded-xl lg:w-44">
          <SelectValue placeholder="Filter state" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All clients</SelectItem>
          <SelectItem value="with_balance">With balance</SelectItem>
          <SelectItem value="unpaid">Unpaid</SelectItem>
          <SelectItem value="partially_paid">Partially paid</SelectItem>
          <SelectItem value="paid_in_full">Paid in full</SelectItem>
        </SelectContent>
      </Select>

      <Select
        value={sortBy}
        onValueChange={(value) => onSortChange(value as PaymentListSort)}
      >
        <SelectTrigger className="w-full rounded-xl lg:w-52">
          <SelectValue placeholder="Sort clients" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="highest_balance">Highest balance</SelectItem>
          <SelectItem value="lowest_balance">Lowest balance</SelectItem>
          <SelectItem value="recent_payment">Recent payment</SelectItem>
          <SelectItem value="company">Company A-Z</SelectItem>
        </SelectContent>
      </Select>

      <LimitSelector
        value={itemsPerPage}
        onValueChange={onItemsPerPageChange}
        options={[10, 20, 50]}
      />
    </div>
  )
}
