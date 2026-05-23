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
import { FileCode2, Plus, X } from "lucide-react"
import { toast } from "sonner"
import * as z from "zod"
import { projectSchema } from "@/lib/validations/project-validation"
import { Spinner } from "@/components/ui/spinner"

interface CreateProjectDialogProps {
  clientId: Id<"clients">
  companyName: string
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: () => void
}

export function CreateProjectDialog({
  clientId,
  companyName,
  open,
  onOpenChange,
  onSuccess,
}: CreateProjectDialogProps) {
  const createProject = useMutation(api.sales.clients.mutations.createProject)

  const [features, setFeatures] = useState<string[]>([])
  const [featureInput, setFeatureInput] = useState("")

  const {
    handleSubmit,
    control,
    reset,
    formState: { isSubmitting },
  } = useForm<z.input<typeof projectSchema>>({
    resolver: zodResolver(projectSchema),
    defaultValues: {
      name: "",
      projectType: "ecommerce",
      price: "" as unknown as number,
      paymentMethod: "bank_transfer",
      estimatedTimeline: new Date().toISOString().split("T")[0],
      scope: "",
      notes: "",
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

  const onSubmit = async (values: z.input<typeof projectSchema>) => {
    try {
      const data = projectSchema.parse(values)
      const estimatedTimelineTimestamp = new Date(
        data.estimatedTimeline
      ).getTime()

      await createProject({
        clientId,
        name: data.name,
        projectType: data.projectType,
        price: data.price,
        paymentMethod: data.paymentMethod,
        estimatedTimeline: estimatedTimelineTimestamp,
        scope: data.scope,
        notes: data.notes || undefined,
        features,
      })

      toast.success("Project provisioned successfully")
      reset()
      setFeatures([])
      setFeatureInput("")
      onOpenChange(false)
      if (onSuccess) onSuccess()
    } catch (error) {
      console.error(error)
      const msg =
        error instanceof Error ? error.message : "Error creating project"
      toast.error(msg)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[95vw] overflow-hidden rounded-xl p-0 sm:max-w-2xl">
        <DialogHeader className="border-b bg-accent p-4">
          <div className="flex items-center gap-3">
            <div className="text-foreground">
              <FileCode2 className="h-5 w-5" />
            </div>
            <div>
              <DialogTitle className="text-lg font-black tracking-tight uppercase">
                Provision New Project
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
                    htmlFor="name"
                    className="text-[10px] font-black tracking-wider text-muted-foreground uppercase"
                  >
                    Project Name
                  </FieldLabel>
                  <Input
                    {...field}
                    id="name"
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
                      htmlFor="projectType"
                      className="text-[10px] font-black tracking-wider text-muted-foreground uppercase"
                    >
                      Project Type
                    </FieldLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <SelectTrigger
                        id="projectType"
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
                      htmlFor="paymentMethod"
                      className="text-[10px] font-black tracking-wider text-muted-foreground uppercase"
                    >
                      Payment Method
                    </FieldLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <SelectTrigger
                        id="paymentMethod"
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

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Controller
                control={control}
                name="price"
                render={({ field, fieldState }) => (
                  <Field
                    className="space-y-1.5"
                    data-invalid={fieldState.invalid}
                  >
                    <FieldLabel
                      htmlFor="price"
                      className="text-[10px] font-black tracking-wider text-muted-foreground uppercase"
                    >
                      Price / Budget (DZD)
                    </FieldLabel>
                    <Input
                      {...field}
                      id="price"
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

              <Controller
                control={control}
                name="estimatedTimeline"
                render={({ field, fieldState }) => (
                  <Field
                    className="space-y-1.5"
                    data-invalid={fieldState.invalid}
                  >
                    <FieldLabel
                      htmlFor="estimatedTimeline"
                      className="text-[10px] font-black tracking-wider text-muted-foreground uppercase"
                    >
                      Estimated Client Due Date
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

            <Controller
              control={control}
              name="scope"
              render={({ field, fieldState }) => (
                <Field className="space-y-1" data-invalid={fieldState.invalid}>
                  <FieldLabel
                    htmlFor="scope"
                    className="text-[10px] font-black tracking-wider text-muted-foreground uppercase"
                  >
                    Project Scope / Deliverables
                  </FieldLabel>
                  <Textarea
                    {...field}
                    id="scope"
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
                  id="feature-input"
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
                <div className="max-h-[120px] space-y-1.5 overflow-y-auto rounded-xl border border-border/40 bg-accent/20 p-2">
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
                    htmlFor="notes"
                    className="text-[10px] font-black tracking-wider text-muted-foreground uppercase"
                  >
                    Internal Notes (Optional)
                  </FieldLabel>
                  <Textarea
                    {...field}
                    id="notes"
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
              Create Project
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
