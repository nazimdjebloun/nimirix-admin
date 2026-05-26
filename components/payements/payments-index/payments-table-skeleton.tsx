"use client"

import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"
import {
  paymentTableColClasses,
  paymentTableCols,
} from "./payments-table-header"

interface PaymentsTableSkeletonProps {
  rows: number
}

export function PaymentsTableSkeleton({
  rows,
}: PaymentsTableSkeletonProps) {
  return (
    <>
      {Array.from({ length: rows }).map((_, index) => (
        <div key={index} className="flex items-center border-b last:border-0">
        <div className={cn(paymentTableColClasses, paymentTableCols.client)}>
          <div className="flex flex-col gap-2 py-1">
            <Skeleton className="h-4 w-36" />
            <Skeleton className="h-3 w-24" />
            <Skeleton className="h-3 w-40" />
          </div>
        </div>
          <div className={cn(paymentTableColClasses, paymentTableCols.totalValue)}>
            <div className="flex flex-col gap-2 py-1">
              <Skeleton className="h-5 w-24 rounded-full" />
              <Skeleton className="h-4 w-20" />
            </div>
          </div>
          <div className={cn(paymentTableColClasses, paymentTableCols.paid)}>
            <Skeleton className="h-4 w-20" />
          </div>
          <div className={cn(paymentTableColClasses, paymentTableCols.outstanding)}>
            <Skeleton className="h-4 w-24" />
          </div>
          <div className={cn(paymentTableColClasses, paymentTableCols.projects)}>
            <div className="flex flex-wrap gap-2 py-1">
              <Skeleton className="h-6 w-18 rounded-full" />
              <Skeleton className="h-6 w-24 rounded-full" />
              <Skeleton className="h-6 w-20 rounded-full" />
            </div>
          </div>
          <div
            className={cn(
              paymentTableColClasses,
              paymentTableCols.paymentStates
            )}
          >
            <div className="flex flex-wrap gap-2 py-1">
              <Skeleton className="h-6 w-16 rounded-full" />
              <Skeleton className="h-6 w-18 rounded-full" />
              <Skeleton className="h-6 w-18 rounded-full" />
            </div>
          </div>
          <div className={cn(paymentTableColClasses, paymentTableCols.lastPayment)}>
            <Skeleton className="h-4 w-24" />
          </div>
          <div className={cn(paymentTableColClasses, paymentTableCols.action)}>
            <Skeleton className="h-8 w-16 rounded-xl" />
          </div>
        </div>
      ))}
    </>
  )
}
