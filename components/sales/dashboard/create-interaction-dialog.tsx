"use client";

import { useForm, Controller, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
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
  SelectGroup, 
  SelectItem, 
  SelectLabel, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { DatePicker } from "@/components/shared/date-picker";
import { Phone } from "lucide-react";
import { toast } from "sonner";
import ClientInteractionList from "@/components/sales/dashboard/client-interaction-list";
import { Spinner } from "@/components/ui/spinner";

const createInteractionSchema = z.object({
  type: z.enum(["call", "email"]),
  status: z.enum(["scheduled", "completed", "missed", "no_response"]),
  scheduledAtDate: z.string().min(1, "Date is required"),
  scheduledAtTime: z.string().min(1, "Time is required"),
  outcome: z.enum(["positive", "neutral", "negative"]).optional(),
  notes: z.string().optional(),
  brief: z.string().optional(),
});

type FormValues = z.infer<typeof createInteractionSchema>;

interface CreateInteractionDialogProps {
  clientId: Id<"clients">;
  companyName: string;
  open:boolean
  onOpenChange: (open: boolean) => void;
}

export function CreateInteractionDialog({ clientId, companyName, open, onOpenChange }: CreateInteractionDialogProps) {
  const createInteraction = useMutation(api.sales.interactions.mutations.createInteraction);

  const { 
    handleSubmit, 
    control, 
    reset,
    formState: { isSubmitting } 
  } = useForm<FormValues>({
    resolver: zodResolver(createInteractionSchema as never),
    defaultValues: {
      type: "call",
      status: "scheduled",
      scheduledAtDate: new Date().toISOString().split('T')[0],
      scheduledAtTime: new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' }),
      notes: "",
    },
  });

  const interactionStatus = useWatch({ control, name: "status" });

  const onSubmit = async (data: FormValues) => {
    try {
      const scheduledAt = new Date(`${data.scheduledAtDate}T${data.scheduledAtTime}`).getTime();
      
      await createInteraction({
        clientId,
        type: data.type,
        status: data.status,
        scheduledAt,
        outcome: data.outcome,
        notes: data.notes || undefined,
        brief: data.brief || undefined,
      });

      toast.success(data.status === "completed" ? "Interaction saved" : "Reminder scheduled");
      onOpenChange(false);
      reset();
    } catch (error) {
      console.error(error);
      toast.error("Error saving interaction");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="p-0 w-[95vw] sm:max-w-2xl rounded-xl overflow-hidden">
        <DialogHeader className="p-3 border-b bg-accent">
          <div className="flex items-center gap-3">
            <div className="text-foreground">
              <Phone className="h-5 w-5" />
            </div>
            <div>
              <DialogTitle className="text-lg font-black tracking-tight uppercase">New Interaction</DialogTitle>
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mt-0.5">
                Client: <span className="text-foreground font-black">{companyName}</span>
              </p>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="max-h-[60vh] overflow-y-auto pr-1">
            <div className="px-2 pt-2">
              <ClientInteractionList clientId={clientId} />
            </div>

            <div className="px-3 py-4 space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Controller
                  control={control}
                  name="type"
                  render={({ field, fieldState }) => (
                    <Field className="space-y-1.5" data-invalid={fieldState.invalid}>
                      <FieldLabel className="text-[10px] font-black text-muted-foreground uppercase tracking-wider">Method</FieldLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectGroup>
                            <SelectLabel className="text-[10px] font-black text-muted-foreground uppercase tracking-wider">Interaction Type</SelectLabel>
                            <SelectItem value="call" className="text-xs">Call</SelectItem>
                            <SelectItem value="email" className="text-xs">Email</SelectItem>
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
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectGroup>
                            <SelectLabel className="text-[10px] font-black text-muted-foreground uppercase tracking-wider">Status</SelectLabel>
                            <SelectItem value="completed" className="text-emerald-500 text-xs">Completed</SelectItem>
                            <SelectItem value="scheduled" className="text-blue-500 text-xs">Scheduled (Reminder)</SelectItem>
                            <SelectItem value="missed" className="text-amber-500 text-xs">Missed</SelectItem>
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
                  name="scheduledAtDate"
                  render={({ field, fieldState }) => (
                    <Field className="space-y-1.5" data-invalid={fieldState.invalid}>
                      <FieldLabel className="text-[10px] font-black text-muted-foreground uppercase tracking-wider">Date</FieldLabel>
                      <DatePicker 
                        value={field.value} 
                        onChange={field.onChange}
                        ariaInvalid={fieldState.invalid}
                      />
                      {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                    </Field>
                  )}
                />

                <Controller
                  control={control}
                  name="scheduledAtTime"
                  render={({ field, fieldState }) => (
                    <Field className="space-y-1.5" data-invalid={fieldState.invalid}>
                      <FieldLabel className="text-[10px] font-black text-muted-foreground uppercase tracking-wider">Time</FieldLabel>
                      <Input 
                        {...field}
                        type="time" 
                        className="bg-background text-foreground"
                        aria-invalid={fieldState.invalid}
                      />
                      {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                    </Field>
                  )}
                />
              </div>

              {interactionStatus === "completed" && (
                <Controller
                  control={control}
                  name="outcome"
                  render={({ field, fieldState }) => (
                    <Field className="space-y-1.5 animate-in fade-in slide-in-from-top-1 duration-200" data-invalid={fieldState.invalid}>
                      <FieldLabel className="text-[10px] font-black text-muted-foreground uppercase tracking-wider">Interaction Outcome</FieldLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Optional" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectGroup>
                            <SelectLabel className="text-[10px] font-black text-muted-foreground uppercase tracking-wider">Outcome</SelectLabel>
                            <SelectItem value="positive" className="text-emerald-500 text-xs">Positive</SelectItem>
                            <SelectItem value="neutral" className="text-slate-500 text-xs">Neutral</SelectItem>
                            <SelectItem value="negative" className="text-destructive text-xs">Negative</SelectItem>
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
                    <FieldLabel className="text-[10px] font-black text-muted-foreground uppercase tracking-wider">Notes</FieldLabel>
                    <Textarea 
                      {...field}
                      placeholder="Interaction details..." 
                      className="font-medium bg-secondary/20 border-border/40 resize-none text-foreground"
                      aria-invalid={fieldState.invalid}
                    />
                    {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                  </Field>
                )}
              />

              {interactionStatus === "completed" && (
                <Controller
                  control={control}
                  name="brief"
                  render={({ field, fieldState }) => (
                    <Field className="space-y-1.5 animate-in fade-in slide-in-from-top-1 duration-200" data-invalid={fieldState.invalid}>
                      <FieldLabel className="text-[10px] font-black text-muted-foreground uppercase tracking-wider">Brief</FieldLabel>
                      <Textarea 
                        {...field}
                        placeholder="Summary of exchange..." 
                        className="font-medium bg-secondary/20 border-border/40 resize-none text-foreground"
                        aria-invalid={fieldState.invalid}
                      />
                      {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                    </Field>
                  )}
                />
              )}
            </div>
          </div>

          <DialogFooter className="bg-accent border-t p-2!">
            <Button variant="outline" type="button" onClick={() => reset({
              type: "call",
              status: "completed",
              scheduledAtDate: new Date().toISOString().split('T')[0],
              scheduledAtTime: new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' }),
              notes: "",
              brief: "",
            })}>Reset</Button>
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button 
              type="submit" 
              variant="default"
              className="uppercase tracking-widest text-[11px]"
              disabled={isSubmitting}
            >
              {isSubmitting ? <Spinner className="mr-2" /> : null}
              {interactionStatus === "completed" ? "Save interaction" : "Schedule reminder"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
