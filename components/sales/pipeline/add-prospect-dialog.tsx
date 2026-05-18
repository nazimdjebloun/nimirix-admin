"use client";

import * as React from "react"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { Controller, useForm } from "react-hook-form"
import { toast } from "sonner"
import { useMutation } from "convex/react"
import { api } from "@/convex/_generated/api"
import { leadSchema } from "@/lib/validations/lead"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { UserSelect } from "@/components/shared/user-select"
import { ScrollArea } from "@/components/ui/scroll-area";

export function AddProspectDialog({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = React.useState(false)
  const createClient = useMutation(api.sales.pipeline.mutations.createClient)

  const form = useForm({
    resolver: zodResolver(leadSchema),
defaultValues: {
  // Text inputs → "" (controlled)
  companyName: "",
  contact: "",
  email: "",
  phone: "",
  notes: "",
  activity: "",
  address: "",
  // Non-text / select → undefined is fine
  status: "prospect",
  priority: "medium",
  salesPersonId: undefined,
}
  })

  async function onSubmit(data: z.infer<typeof leadSchema>) {
    try {
      await createClient({
        ...data,
      })
      toast.success("Prospect created successfully")
      setOpen(false)
      form.reset()
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to create prospect"
      toast.error(errorMessage)
    }
  }

  function handleOpenChange(next: boolean) {
    if (!next) form.reset()
    setOpen(next)
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="sm:max-w-125 max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>Add New Lead</DialogTitle>
          <DialogDescription>
            Enter the lead details to add them to your sales pipeline.
          </DialogDescription>
        </DialogHeader>
        
        <form id="add-lead-form" onSubmit={form.handleSubmit(onSubmit)}>
          <ScrollArea className="h-full max-h-[calc(90vh-10rem)] px-2.5">
            <FieldGroup className="space-y-3 py-4">
            <Controller
              name="companyName"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel>Company Name</FieldLabel>
                  <Input {...field} placeholder="e.g. Acme Industries" />
                  {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                </Field>
              )}
            />

            <Controller
              name="contact"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel>Contact Name</FieldLabel>
                  <Input {...field} placeholder="e.g. John Doe" />
                  {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                </Field>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <Controller
                name="status"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel>Status</FieldLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="prospect">Prospect</SelectItem>
                        <SelectItem value="initial_contact">Initial Contact</SelectItem>
                        <SelectItem value="negotiation">Negotiation</SelectItem>
                        <SelectItem value="verbal_agreement">Verbal Agreement</SelectItem>
                        <SelectItem value="lost">Lost</SelectItem>
                      </SelectContent>
                    </Select>
                    {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                  </Field>
                )}
              />

              <Controller
                name="priority"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel>Priority</FieldLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select priority" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Low</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                        <SelectItem value="urgent">Urgent</SelectItem>
                      </SelectContent>
                    </Select>
                    {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                  </Field>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Controller
                name="email"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel>Email</FieldLabel>
                    <Input {...field} type="email" placeholder="email@example.com" />
                    {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                  </Field>
                )}
              />

              <Controller
                name="phone"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel>Phone</FieldLabel>
                    <Input {...field} placeholder="+33 ..." />
                    {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                  </Field>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Controller
                name="activity"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel>Activity</FieldLabel>
                    <Input {...field} placeholder="e.g. Retail, Tech, etc." />
                    {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                  </Field>
                )}
              />

              <Controller
                name="address"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel>Address</FieldLabel>
                    <Input {...field} placeholder="Full address..." />
                    {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                  </Field>
                )}
              />
            </div>

            <Controller
              name="salesPersonId"
              control={form.control}
              render={({ field }) => (
                <Field>
                  <FieldLabel>Assign Salesperson</FieldLabel>
                  <UserSelect
                    roles={["sales","admin","leadSales"]} 
                    value={field.value}
                    onValueChange={field.onChange}
                    placeholder="Select salesperson..."
                  />
                </Field>
              )}
            />

            <Controller
              name="notes"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel>Notes</FieldLabel>
                  <Textarea 
                    {...field} 
                    placeholder="Add any specific details about this lead..." 
                    className="min-h-25 resize-none"
                  />
                  {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                </Field>
              )}
            />
          </FieldGroup>
          </ScrollArea>
        </form>

        <DialogFooter className="border-t pt-4 ">
          <Button type="button" variant="ghost" onClick={() => form.reset()}>
            Reset
          </Button>
          <Button type="button" variant="outline" onClick={() => handleOpenChange(false)}>
            Cancel
          </Button>
          <Button type="submit" form="add-lead-form">
            Save Lead
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
