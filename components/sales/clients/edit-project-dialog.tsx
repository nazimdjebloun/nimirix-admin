"use client"

import { useState } from "react"
import { useForm, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useMutation } from "convex/react"
import { api } from "@/convex/_generated/api"
import { Id } from "@/convex/_generated/dataModel"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Field, FieldError, FieldLabel } from "@/components/ui/field"
import { DatePicker } from "@/components/shared/date-picker"
import { Edit3, Plus, X } from "lucide-react"
import { toast } from "sonner"
import * as z from "zod"
import { projectSchema } from "@/lib/validations/project-validation"
import { Spinner } from "@/components/ui/spinner"

const editProjectSchema = projectSchema.extend({
  status: z.enum([
    "pending_initial_payment",
    "pending",
    "in_planning",
    "in_progress",
    "pending_payment",
    "delivered",
    "cancelled",
    "paused",
  ]),
})

type EditProjectSchemaType = z.input<typeof editProjectSchema>

interface EditProjectDialogProps {
  project: {
    _id: Id<"projects">
    name: string
    projectType: "ecommerce" | "landing_page" | "erp" | "mobile_app" | "custom"
    price: number
    paymentMethod: "bank_transfer" | "cash" | "check" | "card"
    estimatedTimeline: number
    scope: string
    notes?: string
    status: "pending_initial_payment" | "pending" | "in_planning" | "in_progress" | "pending_payment" | "delivered" | "cancelled" | "paused"
    features?: string[]
  }
  companyName: string
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: () => void
}

export function EditProjectDialog({
  project,
  companyName,
  open,
  onOpenChange,
  onSuccess,
}: EditProjectDialogProps) {
  const updateProject = useMutation(api.sales.clients.mutations.updateProject)

  const [features, setFeatures] = useState<string[]>(project.features ?? [])
  const [featureInput, setFeatureInput] = useState("")

  const timestampToDateString = (ts: number) => {
    try {
      return new Date(ts).toISOString().split("T")[0]
    } catch {
      return new Date().toISOString().split("T")[0]
    }
  }

  const {
    handleSubmit,
    control,
    formState: { isSubmitting },
  } = useForm<EditProjectSchemaType>({
    resolver: zodResolver(editProjectSchema),
    defaultValues: {
      name: project.name,
      projectType: project.projectType,
      price: project.price,
      paymentMethod: project.paymentMethod,
      estimatedTimeline: timestampToDateString(project.estimatedTimeline),
      scope: project.scope,
      notes: project.notes || "",
      status: project.status,
    },
  })

  function addFeature() {
    const trimmed = featureInput.trim()
    if (trimmed) {
      setFeatures((prev) => [...prev, trimmed])
      setFeatureInput("")
    }
  }

  function removeFeature(index: number) {
    setFeatures((prev) => prev.filter((_, i) => i !== index))
  }

  const onSubmit = async (values: EditProjectSchemaType) => {
    try {
      const data = editProjectSchema.parse(values)
      const estimatedTimelineTimestamp = new Date(
        data.estimatedTimeline
      ).getTime()

      await updateProject({
        projectId: project._id,
        name: data.name,
        projectType: data.projectType,
        price: data.price,
        paymentMethod: data.paymentMethod,
        estimatedTimeline: estimatedTimelineTimestamp,
        scope: data.scope,
        notes: data.notes || undefined,
        status: data.status,
        features,
      })

      toast.success("Project updated successfully")
      onOpenChange(false)
      if (onSuccess) onSuccess()
    } catch (error) {
      console.error(error)
      const msg =
        error instanceof Error ? error.message : "Error updating project"
      toast.error(msg)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[95vw] overflow-hidden rounded-xl p-0 sm:max-w-2xl">
        <DialogHeader className="border-b bg-accent p-4">
          <div className="flex items-center gap-3">
            <div className="text-foreground">
              <Edit3 className="h-5 w-5" />
            </div>
            <div>
              <DialogTitle className="text-lg font-black tracking-tight uppercase">
                Edit Project
              </DialogTitle>
              <p className="mt-0.5 text-[10px] font-bold tracking-widest text-muted-foreground uppercase">
                Client:{" "}
                <span className="font-black text-foreground">
                  {companyName}
                </span>
              </p>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="max-h-[65vh] space-y-4 overflow-y-auto px-4 py-6">
            <Controller
              control={control}
              name="name"
              render={({ field, fieldState }) => (
                <Field
                  className="space-y-1.5"
                  data-invalid={fieldState.invalid}
                >
                  <FieldLabel
                    htmlFor="edit-name"
                    className="text-[10px] font-black tracking-wider text-muted-foreground uppercase"
                  >
                    Project Name
                  </FieldLabel>
                  <Input
                    {...field}
                    id="edit-name"
                    placeholder="e.g. E-Commerce Platform Redesign"
                    aria-invalid={fieldState.invalid}
                    className="bg-background text-foreground"
                  />
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Controller
                control={control}
                name="projectType"
                render={({ field, fieldState }) => (
                  <Field
                    className="space-y-1.5"
                    data-invalid={fieldState.invalid}
                  >
                    <FieldLabel
                      htmlFor="edit-projectType"
                      className="text-[10px] font-black tracking-wider text-muted-foreground uppercase"
                    >
                      Project Type
                    </FieldLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <SelectTrigger
                        id="edit-projectType"
                        className="w-full"
                        aria-invalid={fieldState.invalid}
                      >
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          <SelectLabel className="text-[10px] font-black tracking-wider text-muted-foreground uppercase">
                            Type
                          </SelectLabel>
                          <SelectItem value="ecommerce" className="text-xs">
                            E-Commerce
                          </SelectItem>
                          <SelectItem value="landing_page" className="text-xs">
                            Landing Page
                          </SelectItem>
                          <SelectItem value="erp" className="text-xs">
                            ERP System
                          </SelectItem>
                          <SelectItem value="mobile_app" className="text-xs">
                            Mobile App
                          </SelectItem>
                          <SelectItem value="custom" className="text-xs">
                            Custom Software
                          </SelectItem>
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />

              <Controller
                control={control}
                name="paymentMethod"
                render={({ field, fieldState }) => (
                  <Field
                    className="space-y-1.5"
                    data-invalid={fieldState.invalid}
                  >
                    <FieldLabel
                      htmlFor="edit-paymentMethod"
                      className="text-[10px] font-black tracking-wider text-muted-foreground uppercase"
                    >
                      Payment Method
                    </FieldLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <SelectTrigger
                        id="edit-paymentMethod"
                        className="w-full"
                        aria-invalid={fieldState.invalid}
                      >
                        <SelectValue placeholder="Select method" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          <SelectLabel className="text-[10px] font-black tracking-wider text-muted-foreground uppercase">
                            Method
                          </SelectLabel>
                          <SelectItem value="bank_transfer" className="text-xs">
                            Bank Transfer
                          </SelectItem>
                          <SelectItem value="cash" className="text-xs">
                            Cash
                          </SelectItem>
                          <SelectItem value="check" className="text-xs">
                            Check
                          </SelectItem>
                          <SelectItem value="card" className="text-xs">
                            Credit Card
                          </SelectItem>
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div className="sm:col-span-1">
                <Controller
                  control={control}
                  name="price"
                  render={({ field, fieldState }) => (
                    <Field
                      className="space-y-1.5"
                      data-invalid={fieldState.invalid}
                    >
                      <FieldLabel
                        htmlFor="edit-price"
                        className="text-[10px] font-black tracking-wider text-muted-foreground uppercase"
                      >
                        Price / Budget (DZD)
                      </FieldLabel>
                      <Input
                        {...field}
                        id="edit-price"
                        type="number"
                        value={(field.value as string | number) ?? ""}
                        placeholder="e.g. 500000"
                        aria-invalid={fieldState.invalid}
                        className="bg-background text-foreground"
                      />
                      {fieldState.invalid && (
                        <FieldError errors={[fieldState.error]} />
                      )}
                    </Field>
                  )}
                />
              </div>

              <div className="sm:col-span-1">
                <Controller
                  control={control}
                  name="estimatedTimeline"
                  render={({ field, fieldState }) => (
                    <Field
                      className="space-y-1.5"
                      data-invalid={fieldState.invalid}
                    >
                      <FieldLabel
                        htmlFor="edit-estimatedTimeline"
                        className="text-[10px] font-black tracking-wider text-muted-foreground uppercase"
                      >
                        Client Due Date
                      </FieldLabel>
                      <DatePicker
                        value={
                          typeof field.value === "string"
                            ? field.value
                            : new Date(field.value).toISOString().split("T")[0]
                        }
                        onChange={field.onChange}
                        ariaInvalid={fieldState.invalid}
                      />
                      {fieldState.invalid && (
                        <FieldError errors={[fieldState.error]} />
                      )}
                    </Field>
                  )}
                />
              </div>

              <div className="sm:col-span-1">
                <Controller
                  control={control}
                  name="status"
                  render={({ field, fieldState }) => (
                    <Field
                      className="space-y-1.5"
                      data-invalid={fieldState.invalid}
                    >
                      <FieldLabel
                        htmlFor="edit-status"
                        className="text-[10px] font-black tracking-wider text-muted-foreground uppercase"
                      >
                        Project Status
                      </FieldLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <SelectTrigger
                          id="edit-status"
                          className="w-full"
                          aria-invalid={fieldState.invalid}
                        >
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectGroup>
                            <SelectLabel className="text-[10px] font-black tracking-wider text-muted-foreground uppercase">
                              Status
                            </SelectLabel>
                            <SelectItem value="pending_initial_payment" className="text-xs">
                              Pending Initial Payment
                            </SelectItem>
                            <SelectItem value="pending" className="text-xs">
                              Pending
                            </SelectItem>
                            <SelectItem value="in_planning" className="text-xs">
                              In Planning
                            </SelectItem>
                            <SelectItem value="in_progress" className="text-xs">
                              In Progress
                            </SelectItem>
                            <SelectItem value="pending_payment" className="text-xs">
                              Pending Payment
                            </SelectItem>
                            <SelectItem value="delivered" className="text-xs">
                              Delivered
                            </SelectItem>
                            <SelectItem value="cancelled" className="text-xs">
                              Cancelled
                            </SelectItem>
                            <SelectItem value="paused" className="text-xs">
                              Paused
                            </SelectItem>
                          </SelectGroup>
                        </SelectContent>
                      </Select>
                      {fieldState.invalid && (
                        <FieldError errors={[fieldState.error]} />
                      )}
                    </Field>
                  )}
                />
              </div>
            </div>

            <Controller
              control={control}
              name="scope"
              render={({ field, fieldState }) => (
                <Field className="space-y-1" data-invalid={fieldState.invalid}>
                  <FieldLabel
                    htmlFor="edit-scope"
                    className="text-[10px] font-black tracking-wider text-muted-foreground uppercase"
                  >
                    Project Scope / Deliverables
                  </FieldLabel>
                  <Textarea
                    {...field}
                    id="edit-scope"
                    placeholder="List the main features, objectives, or contract terms..."
                    aria-invalid={fieldState.invalid}
                    className="min-h-[100px] resize-none border-border/40 bg-background font-medium text-foreground"
                    autoComplete="off"
                  />
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />

            {/* ─── Features Builder ─────────────────────────────────── */}
            <div className="space-y-2">
              <p className="text-[10px] font-black tracking-wider text-muted-foreground uppercase">
                Project Features
              </p>
              <div className="flex gap-2">
                <Input
                  id="edit-feature-input"
                  value={featureInput}
                  onChange={(e) => setFeatureInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault()
                      addFeature()
                    }
                  }}
                  placeholder="e.g. User authentication"
                  className="bg-background text-foreground"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="shrink-0 gap-1.5 rounded-xl text-xs font-bold uppercase"
                  onClick={addFeature}
                >
                  <Plus className="h-3.5 w-3.5" />
                  Add
                </Button>
              </div>
              {features.length > 0 && (
                <div className="max-h-[120px] overflow-y-auto rounded-xl border border-border/40 bg-accent/20 p-2 space-y-1.5">
                  {features.map((feature, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between rounded-lg border border-border/20 bg-background px-3 py-1.5"
                    >
                      <span className="text-xs font-medium text-foreground">
                        {feature}
                      </span>
                      <button
                        type="button"
                        onClick={() => removeFeature(i)}
                        className="ml-2 text-muted-foreground transition-colors hover:text-destructive"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
              {features.length === 0 && (
                <p className="text-[10px] text-muted-foreground italic">
                  No features added yet. Type a feature and click Add.
                </p>
              )}
            </div>

            <Controller
              control={control}
              name="notes"
              render={({ field, fieldState }) => (
                <Field className="space-y-1" data-invalid={fieldState.invalid}>
                  <FieldLabel
                    htmlFor="edit-notes"
                    className="text-[10px] font-black tracking-wider text-muted-foreground uppercase"
                  >
                    Internal Notes (Optional)
                  </FieldLabel>
                  <Textarea
                    {...field}
                    id="edit-notes"
                    placeholder="Add additional sales or billing hand-off details..."
                    aria-invalid={fieldState.invalid}
                    className="min-h-[80px] resize-none border-border/40 bg-background font-medium text-foreground"
                    autoComplete="off"
                  />
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />
          </div>

          <DialogFooter className="border-t bg-accent p-3">
            <DialogClose asChild>
              <Button variant="outline" type="button">
                Cancel
              </Button>
            </DialogClose>
            <Button
              type="submit"
              variant="default"
              className="text-[11px] tracking-widest uppercase"
              disabled={isSubmitting}
            >
              {isSubmitting ? <Spinner className="mr-2" /> : null}
              Save Changes
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
