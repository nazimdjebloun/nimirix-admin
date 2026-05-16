"use client";

import * as React from "react"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { Controller, useForm } from "react-hook-form"
import { toast } from "sonner"
import { useMutation } from "convex/react"
import { api } from "@/convex/_generated/api"
import { Doc } from "@/convex/_generated/dataModel"
import { leadSchema } from "@/lib/validations/lead"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
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
import { ScrollArea } from "@/components/ui/scroll-area"

type EditProspectValues = z.infer<typeof leadSchema>;

interface EditProspectDialogProps {
  client: Doc<"clients"> & {
    salesPerson?: { name: string; role: string } | null;
    createdByUser?: { name: string; role: string } | null;
    assignedByUser?: { name: string; role: string } | null;
  };
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EditProspectDialog({ client, open, onOpenChange }: EditProspectDialogProps) {
  const updateClient = useMutation(api.sales.pipeline.mutations.updateClient)
  const [resetKey, setResetKey] = React.useState(0)

  const form = useForm<EditProspectValues>({
    resolver: zodResolver(leadSchema),
    defaultValues: {
      companyName: client?.companyName ?? "",
      contact: client?.contact ?? "",
      status: client?.status ?? "prospect",
      priority: client?.priority ?? "medium",
      email: client?.email ?? "",
      phone: client?.phone ?? "",
      secondaryPhone: client?.secondaryPhone ?? "",
      address: client?.address ?? "",
      contactPhone: client?.contactPhone ?? "",
      contactEmail: client?.contactEmail ?? "",
      notes: client?.notes ?? "",
      salesPersonId: client?.salesPersonId ?? "",
      nif: client?.nif ?? "",
      rc: client?.rc ?? "",
      activity: client?.activity ?? "",
    },
  })

  const { formState: { isDirty, isSubmitting } } = form;

  async function onSubmit(data: EditProspectValues) {
    if (!isDirty) {
      onOpenChange(false);
      return;
    }
    try {
      await updateClient({
        clientId: client._id,
        ...data,
      })
      toast.success("Prospect updated successfully")
      form.reset(data)
      setResetKey(prev => prev + 1)
      onOpenChange(false)
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to update prospect"
      toast.error(errorMessage)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Edit Prospect</DialogTitle>
          <DialogDescription>
            Update the prospect details below. All changes are saved to the sales pipeline.
          </DialogDescription>
        </DialogHeader>
        
        <ScrollArea className="max-h-[70vh] pr-4">
          <form id="edit-prospect-form" onSubmit={form.handleSubmit(onSubmit)}>
            <FieldGroup className="space-y-6 py-4">
              <div className="grid grid-cols-2 gap-4">
                <Controller
                  name="companyName"
                  control={form.control}
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel>Company Name</FieldLabel>
                      <Input {...field} placeholder="Acme Industries" />
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
                      <Input {...field} placeholder="John Doe" />
                      {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                    </Field>
                  )}
                />
              </div>

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
                          <SelectItem value="converted">Converted</SelectItem>
                          <SelectItem value="lost">Lost</SelectItem>
                          <SelectItem value="out_of_target">Out of Target</SelectItem>
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
                      <FieldLabel>Company Email</FieldLabel>
                      <Input {...field} type="email" placeholder="company@example.com" />
                      {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                    </Field>
                  )}
                />

                <Controller
                  name="phone"
                  control={form.control}
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel>Company Phone</FieldLabel>
                      <Input {...field} placeholder="05 12 34 56 78" />
                      {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                    </Field>
                  )}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <Controller
                  name="contactEmail"
                  control={form.control}
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel>Contact Email</FieldLabel>
                      <Input {...field} type="email" placeholder="contact@example.com" />
                      {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                    </Field>
                  )}
                />

                <Controller
                  name="contactPhone"
                  control={form.control}
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel>Contact Phone</FieldLabel>
                      <Input {...field} placeholder="+..." />
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
                    <FieldLabel>Assigned Salesperson</FieldLabel>
                    <UserSelect
                      key={`${client._id}-${resetKey}`}
                      value={field.value}
                      onValueChange={field.onChange}
                      placeholder="Select salesperson..."
                      roles={["sales", "leadSales","admin"]}
                      initialUser={client.salesPerson ? { 
                        _id: client.salesPersonId ?? "", 
                        name: client.salesPerson.name,
                        role: client.salesPerson.role 
                      } : null}
                    />
                  </Field>
                )}
              />

              <div className="grid grid-cols-2 gap-4">
                <Controller
                  name="nif"
                  control={form.control}
                  render={({ field }) => (
                    <Field>
                      <FieldLabel>NIF</FieldLabel>
                      <Input {...field} placeholder="Tax ID (NIF)" />
                    </Field>
                  )}
                />
                <Controller
                  name="rc"
                  control={form.control}
                  render={({ field }) => (
                    <Field>
                      <FieldLabel>RC</FieldLabel>
                      <Input {...field} placeholder="Commercial Register (RC)" />
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
                      <Input {...field} placeholder="e.g. Retail" />
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
                      <Input {...field} placeholder="Full address" />
                      {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                    </Field>
                  )}
                />
              </div>

              <Controller
                name="notes"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel>Notes</FieldLabel>
                    <Textarea 
                      {...field} 
                      placeholder="Add details about this prospect..." 
                      className="min-h-32 resize-none"
                    />
                    {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                  </Field>
                )}
              />
            </FieldGroup>
          </form>
        </ScrollArea>

        <DialogFooter className="border-t pt-4 flex items-center justify-between">
          <div className="flex items-center gap-2">

            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
          </div>

          <div className="flex items-center gap-2">
            <Button 
              type="button" 
              variant="destructive" 
              onClick={() => {
                form.reset();
                setResetKey(prev => prev + 1);
              }}
            >
              Reset
            </Button>
            <Button type="submit" form="edit-prospect-form" disabled={!isDirty || isSubmitting}>
              {isSubmitting ? "Updating..." : "Update Prospect"}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
