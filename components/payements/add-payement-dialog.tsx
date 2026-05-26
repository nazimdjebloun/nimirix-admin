"use client"

import { useMemo, useState } from "react"
import { useMutation, useQuery } from "convex/react"
import { api } from "@/convex/_generated/api"
import { Doc } from "@/convex/_generated/dataModel"
import { Receipt } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Dialog, DialogClose, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Field, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { Spinner } from "@/components/ui/spinner"
import { formatCurrency } from "./lib"

interface AddPayementDialogProps {
  project: Doc<"projects">
  open: boolean
  onOpenChange: (open: boolean) => void
}

const TAX_RATE = 0.19

export function AddPayementDialog({
  project,
  open,
  onOpenChange,
}: AddPayementDialogProps) {
  const [amount, setAmount] = useState("")
  const [paymentMethod, setPaymentMethod] = useState(project.paymentMethod)
  const [paymentDate, setPaymentDate] = useState(
    new Date().toISOString().split("T")[0]
  )
  const [notes, setNotes] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const totalPaid = useQuery(api.admin.payements.queries.getProjectPaymentsTotal, {
    projectId: project._id,
  })
  const createPayment = useMutation(api.admin.payements.mutations.createPayment)

  const parsedAmount = Number(amount) || 0
  const safeTotalPaid = totalPaid ?? 0
  const remainingBalance = Math.max(project.price - safeTotalPaid, 0)
  const isFullyPaid = remainingBalance <= 0
  const taxAmount = parsedAmount * TAX_RATE
  const totalWithTax = parsedAmount + taxAmount
  const recommendedAmount = useMemo(() => {
    if (isFullyPaid) {
      return []
    }

    if (project.status === "pending_initial_payment") {
      return [
        Math.min(Math.round(project.price * 0.5), remainingBalance),
        Math.min(Math.round(project.price * 0.25), remainingBalance),
      ]
    }

    return [
      remainingBalance,
      Math.min(Math.round(remainingBalance * 0.5), remainingBalance),
    ]
  }, [isFullyPaid, project.price, project.status, remainingBalance])
  const percentageAmounts = useMemo(() => {
    if (isFullyPaid) {
      return []
    }

    return [
      {
        label: "100%",
        value: remainingBalance,
      },
      {
        label: "50%",
        value: Math.min(Math.round(remainingBalance * 0.5), remainingBalance),
      },
      {
        label: "25%",
        value: Math.min(Math.round(remainingBalance * 0.25), remainingBalance),
      },
    ].filter((item, index, items) => {
      return items.findIndex((candidate) => candidate.value === item.value) === index
    })
  }, [isFullyPaid, remainingBalance])

  const handleSubmit = async () => {
    if (isFullyPaid) {
      toast.error("This project is already fully paid")
      return
    }

    if (!amount || parsedAmount <= 0) {
      toast.error("Please enter a valid amount")
      return
    }

    if (parsedAmount > remainingBalance) {
      toast.error(
        `Payment cannot exceed ${formatCurrency(remainingBalance, "DZD")}`
      )
      return
    }

    setIsSubmitting(true)

    try {
      await createPayment({
        projectId: project._id,
        amount: parsedAmount,
        paymentMethod,
        paymentDate: new Date(paymentDate).getTime(),
        notes: notes || undefined,
      })

      toast.success("Payment recorded successfully")
      onOpenChange(false)
      setAmount("")
      setNotes("")
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to record payment"
      toast.error(message)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[95vw] overflow-hidden rounded-2xl p-0 sm:max-w-lg">
        <DialogHeader className="border-b bg-accent p-4">
          <div className="flex items-center gap-3">
            <Receipt className="h-5 w-5 text-foreground" />
            <div>
              <DialogTitle className="text-lg font-black tracking-tight">
                Record Payment
              </DialogTitle>
              <p className="mt-0.5 text-[10px] font-bold tracking-widest text-muted-foreground uppercase">
                {project.name}
              </p>
            </div>
          </div>
        </DialogHeader>

        <div className="max-h-[65vh] space-y-4 overflow-y-auto px-4 py-6">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <div className="rounded-xl border border-border/50 bg-muted/30 p-3">
              <p className="text-[10px] font-black tracking-widest text-muted-foreground uppercase">
                Total Value
              </p>
              <p className="mt-2 text-base font-black text-foreground">
                {formatCurrency(project.price, "DZD")}
              </p>
            </div>
            <div className="rounded-xl border border-border/50 bg-muted/30 p-3">
              <p className="text-[10px] font-black tracking-widest text-muted-foreground uppercase">
                Already Paid
              </p>
              <p className="mt-2 text-base font-black text-foreground">
                {formatCurrency(safeTotalPaid, "DZD")}
              </p>
            </div>
            <div className="rounded-xl border border-border/50 bg-muted/30 p-3">
              <p className="text-[10px] font-black tracking-widest text-muted-foreground uppercase">
                Remaining
              </p>
              <p className="mt-2 text-base font-black text-foreground">
                {formatCurrency(remainingBalance, "DZD")}
              </p>
            </div>
          </div>

          <div
            className={`rounded-xl border p-3 text-sm ${
              isFullyPaid
                ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300"
                : "border-amber-500/20 bg-amber-500/10 text-amber-700 dark:text-amber-300"
            }`}
          >
            {isFullyPaid
              ? "This project is already fully paid. No additional payment can be recorded."
              : `You can record up to ${formatCurrency(remainingBalance, "DZD")} for this project.`}
          </div>

          {recommendedAmount.length > 0 ? (
            <div className="space-y-2">
              <FieldLabel className="text-[10px] font-black tracking-wider text-muted-foreground uppercase">
                Quick Fill
              </FieldLabel>
              <div className="grid grid-cols-2 gap-2">
                {recommendedAmount.map((value) => (
                  <Button
                    key={value}
                    type="button"
                    variant="outline"
                    onClick={() => setAmount(value.toString())}
                    className="rounded-xl text-[10px] font-black uppercase"
                  >
                    {formatCurrency(value, "DZD")}
                  </Button>
                ))}
              </div>
              {percentageAmounts.length > 0 ? (
                <div className="grid grid-cols-3 gap-2">
                  {percentageAmounts.map((item) => (
                    <Button
                      key={item.label}
                      type="button"
                      variant="ghost"
                      onClick={() => setAmount(item.value.toString())}
                      className="rounded-xl border border-border/50 text-[10px] font-black uppercase"
                    >
                      {item.label}
                    </Button>
                  ))}
                </div>
              ) : null}
            </div>
          ) : null}

          <Field className="space-y-1.5">
            <FieldLabel className="text-[10px] font-black tracking-wider text-muted-foreground uppercase">
              Amount
            </FieldLabel>
            <Input
              type="number"
              min={0}
              max={remainingBalance}
              value={amount}
              onChange={(event) => setAmount(event.target.value)}
              placeholder="Enter amount"
              className="bg-background text-foreground"
            />
          </Field>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field className="space-y-1.5">
              <FieldLabel className="text-[10px] font-black tracking-wider text-muted-foreground uppercase">
                Payment Method
              </FieldLabel>
              <Select
                value={paymentMethod}
                onValueChange={(value) =>
                  setPaymentMethod(
                    value as "bank_transfer" | "cash" | "check" | "card"
                  )
                }
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select method" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel>Method</SelectLabel>
                    <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                    <SelectItem value="cash">Cash</SelectItem>
                    <SelectItem value="check">Check</SelectItem>
                    <SelectItem value="card">Card</SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
            </Field>

            <Field className="space-y-1.5">
              <FieldLabel className="text-[10px] font-black tracking-wider text-muted-foreground uppercase">
                Payment Date
              </FieldLabel>
              <Input
                type="date"
                value={paymentDate}
                onChange={(event) => setPaymentDate(event.target.value)}
                className="bg-background text-foreground"
              />
            </Field>
          </div>

          <Field className="space-y-1.5">
            <FieldLabel className="text-[10px] font-black tracking-wider text-muted-foreground uppercase">
              Notes
            </FieldLabel>
            <Input
              value={notes}
              onChange={(event) => setNotes(event.target.value)}
              placeholder="Optional note"
              className="bg-background text-foreground"
            />
          </Field>

          <Separator />

          <div className="space-y-2 rounded-xl border border-border/50 bg-muted/20 p-3">
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground">Subtotal</span>
              <span className="font-bold">
                {formatCurrency(parsedAmount, "DZD")}
              </span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground">Tax (19%)</span>
              <span className="font-bold">
                {formatCurrency(parsedAmount > 0 ? taxAmount : 0, "DZD")}
              </span>
            </div>
            <Separator />
            <div className="flex justify-between text-sm">
              <span className="font-bold">Total</span>
              <span className="font-black text-primary">
                {formatCurrency(parsedAmount > 0 ? totalWithTax : 0, "DZD")}
              </span>
            </div>
          </div>
        </div>

        <DialogFooter className="border-t bg-accent p-3">
          <DialogClose asChild>
            <Button variant="outline" type="button">
              Cancel
            </Button>
          </DialogClose>
          <Button
            type="button"
            onClick={handleSubmit}
            disabled={isSubmitting || isFullyPaid}
            className="text-[11px] tracking-widest uppercase"
          >
            {isSubmitting ? <Spinner className="mr-2" /> : null}
            {isSubmitting ? "Saving..." : "Record Payment"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
