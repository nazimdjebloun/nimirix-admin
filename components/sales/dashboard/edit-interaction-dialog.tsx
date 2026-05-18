"use client";

import { useForm, Controller, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Doc } from "@/convex/_generated/dataModel";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter,
  DialogClose
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue,
  SelectGroup, 
  SelectLabel 
} from "@/components/ui/select";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { DatePicker } from "@/components/shared/date-picker";
import { Edit2 } from "lucide-react";
import { Spinner } from "@/components/ui/spinner";
import { toast } from "sonner";
import { useState } from "react";
import { DeleteInteractionAlertDialog } from "./delete-interaction-alert-dialog";

const editInteractionSchema = z.object({
  type: z.enum(["call", "email"]),
  status: z.enum(["scheduled", "completed", "missed", "no_response"]),
  date: z.string().min(1, "La date est requise"),
  time: z.string().min(1, "L'heure est requise"),
  outcome: z.enum(["positive", "neutral", "negative"]).optional(),
  notes: z.string().optional(),
});

type FormValues = z.infer<typeof editInteractionSchema>;

interface EditInteractionDialogProps {
  interaction: Doc<"clientInteractions"> & { client?: { companyName: string } | null };
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EditInteractionDialog({ interaction, open, onOpenChange }: EditInteractionDialogProps) {
  const updateInteraction = useMutation(api.sales.interactions.mutations.updateInteraction);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const { 
    handleSubmit, 
    control, 
    reset,
    formState: { isSubmitting } 
  } = useForm<FormValues>({
    resolver: zodResolver(editInteractionSchema as never),
    defaultValues: {
      type: interaction.type,
      status: interaction.status,
      date: new Date(interaction.scheduledAt).toISOString().split('T')[0],
      time: new Date(interaction.scheduledAt).toTimeString().slice(0, 5),
      outcome: interaction.outcome,
      notes: interaction.notes || "",
    },
  });

  const interactionStatus = useWatch({
    control,
    name: "status",
  });

  const onSubmit = async (data: FormValues) => {
    try {
      const scheduledAt = new Date(`${data.date}T${data.time}`).getTime();
      
      await updateInteraction({
        interactionId: interaction._id,
        type: data.type,
        status: data.status,
        scheduledAt,
        outcome: data.outcome,
        notes: data.notes || undefined,
      });

      toast.success("Interaction updated successfully");
      onOpenChange(false);
    } catch (error) {
      console.error(error);
      toast.error("Error updating interaction");
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="p-0 w-[95vw] sm:max-w-2xl rounded-xl overflow-hidden">
          <DialogHeader className="p-3 border-b bg-accent">
            <div className="flex items-center gap-3">
              <div className="text-foreground">
                <Edit2 className="h-5 w-5" />
              </div>
              <div>
                <DialogTitle className="text-lg font-black tracking-tight uppercase">Edit Interaction</DialogTitle>
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mt-0.5">
                  Client: <span className="text-foreground font-black">{interaction.client?.companyName || "Unknown Client"}</span>
                </p>
              </div>
            </div>
          </DialogHeader>

          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="max-h-[60vh] overflow-y-auto pr-1">
              <div className="px-3 pt-3 pb-4 space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <Controller
                    control={control}
                    name="type"
                    render={({ field, fieldState }) => (
                      <Field className="space-y-1.5" data-invalid={fieldState.invalid}>
                        <FieldLabel className="text-[10px] font-black text-muted-foreground uppercase tracking-wider">Medium</FieldLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <SelectTrigger className="w-full bg-secondary/20 border-border/40 focus-visible:ring-primary/20 text-foreground">
                            <SelectValue placeholder="Select" />
                          </SelectTrigger>
                          <SelectContent className="w-full">
                            <SelectGroup>
                              <SelectLabel className="text-[10px] font-black text-muted-foreground uppercase tracking-wider">Type</SelectLabel>
                              <SelectItem value="call" className="text-xs uppercase font-medium">Call</SelectItem>
                              <SelectItem value="email" className="text-xs uppercase font-medium">Email</SelectItem>
                            </SelectGroup>
                          </SelectContent>
                        </Select>
                        {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                      </Field>
                    )}
                  />

                  <Controller
                    control={control}
                    name="status"
                    render={({ field, fieldState }) => (
                      <Field className="space-y-1.5" data-invalid={fieldState.invalid}>
                        <FieldLabel className="text-[10px] font-black text-muted-foreground uppercase tracking-wider">Status</FieldLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <SelectTrigger className="w-full bg-secondary/20 border-border/40 focus-visible:ring-primary/20 text-foreground">
                            <SelectValue placeholder="Status" />
                          </SelectTrigger>
                          <SelectContent className="w-full">
                            <SelectGroup>
                              <SelectLabel className="text-[10px] font-black text-muted-foreground uppercase tracking-wider">Status</SelectLabel>
                              <SelectItem value="completed" className="font-medium text-emerald-500">Completed</SelectItem>
                              <SelectItem value="scheduled" className="font-medium text-blue-500">Scheduled</SelectItem>
                              <SelectItem value="missed" className="font-medium text-amber-500">Missed</SelectItem>
                              <SelectItem value="no_response" className="font-medium text-destructive">No response</SelectItem>
                            </SelectGroup>
                          </SelectContent>
                        </Select>
                        {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                      </Field>
                    )}
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <Controller
                    control={control}
                    name="date"
                    render={({ field, fieldState }) => (
                      <Field className="space-y-1.5" data-invalid={fieldState.invalid}>
                        <FieldLabel className="text-[10px] font-black text-muted-foreground uppercase tracking-wider">Date</FieldLabel>
                        <DatePicker 
                          value={field.value} 
                          onChange={field.onChange}
                        />
                        {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                      </Field>
                    )}
                  />

                  <Controller
                    control={control}
                    name="time"
                    render={({ field, fieldState }) => (
                      <Field className="space-y-1.5" data-invalid={fieldState.invalid}>
                        <FieldLabel className="text-[10px] font-black text-muted-foreground uppercase tracking-wider">Time</FieldLabel>
                        <Input 
                          type="time" 
                          {...field}
                          className="bg-background border-border/40 focus-visible:ring-primary/20 text-foreground font-medium"
                        />
                        {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                      </Field>
                    )}
                  />
                </div>

                {(interactionStatus === "completed" || interactionStatus === "missed" || interactionStatus === "no_response") && (
                  <Controller
                    control={control}
                    name="outcome"
                    render={({ field, fieldState }) => (
                      <Field className="space-y-1.5 animate-in fade-in slide-in-from-top-1 duration-200" data-invalid={fieldState.invalid}>
                        <FieldLabel className="text-[10px] font-black text-muted-foreground uppercase tracking-wider">Outcome / Feeling</FieldLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <SelectTrigger className="w-full bg-secondary/20 border-border/40 focus-visible:ring-primary/20 text-foreground">
                            <SelectValue placeholder="Optional" />
                          </SelectTrigger>
                          <SelectContent className="w-full">
                            <SelectGroup>
                              <SelectLabel className="text-[10px] font-black text-muted-foreground uppercase tracking-wider">Outcome</SelectLabel>
                              <SelectItem value="positive" className="font-medium text-emerald-500">Positive (+)</SelectItem>
                              <SelectItem value="neutral" className="font-medium text-slate-500">Neutral (=)</SelectItem>
                              <SelectItem value="negative" className="font-medium text-destructive">Negative (-)</SelectItem>
                            </SelectGroup>
                          </SelectContent>
                        </Select>
                        {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                      </Field>
                    )}
                  />
                )}

                <Controller
                  control={control}
                  name="notes"
                  render={({ field, fieldState }) => (
                    <Field className="space-y-1.5" data-invalid={fieldState.invalid}>
                      <FieldLabel className="text-[10px] font-black text-muted-foreground uppercase tracking-wider">Notes / Brief</FieldLabel>
                      <Textarea 
                        {...field}
                        placeholder="Interaction details..." 
                        className="min-h-25 font-medium bg-secondary/20 border-border/40 focus-visible:ring-primary/20 resize-none text-foreground"
                      />
                      {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                    </Field>
                  )}
                />
              </div>
            </div>

            <DialogFooter className="bg-accent border-t p-2 flex flex-col sm:flex-row gap-2 justify-between items-stretch sm:items-center w-full">
              <Button 
                variant="destructive" 
                type="button" 
                className="w-full sm:w-auto uppercase tracking-widest text-[11px]"
                onClick={() => setDeleteDialogOpen(true)}
              >
                Delete
              </Button>
              <div className="flex gap-2 w-full sm:w-auto">
                <Button variant="outline" type="button" onClick={() => reset()} className="flex-1 sm:flex-none">Reset</Button>
                <DialogClose asChild>
                  <Button variant="outline" className="flex-1 sm:flex-none">Cancel</Button>
                </DialogClose>
                <Button 
                  type="submit" 
                  variant="default"
                  className="flex-1 sm:flex-none uppercase tracking-widest text-[11px]"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? <Spinner className="mr-2" /> : null}
                  Save
                </Button>
              </div>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <DeleteInteractionAlertDialog
        interaction={interaction}
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onSuccess={() => onOpenChange(false)}
      />
    </>
  );
}
