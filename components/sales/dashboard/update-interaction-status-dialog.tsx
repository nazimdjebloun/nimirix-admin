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
import { MessageSquare } from "lucide-react";
import { Spinner } from "@/components/ui/spinner";
import { toast } from "sonner";
import { useEffect } from "react";

const updateInteractionStatusSchema = z.object({
  status: z.enum(["scheduled", "completed", "missed", "no_response"]),
  outcome: z.enum(["positive", "neutral", "negative"]).optional(),
  brief: z.string().optional(),
});

type FormValues = z.infer<typeof updateInteractionStatusSchema>;

interface UpdateInteractionStatusDialogProps {
  interaction: {
    _id: Id<"clientInteractions">;
    status: "scheduled" | "completed" | "missed" | "no_response";
    outcome?: "positive" | "neutral" | "negative";
    brief?: string;
    client?: { companyName: string } | null;
  };
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function UpdateInteractionStatusDialog({ interaction, open, onOpenChange }: UpdateInteractionStatusDialogProps) {
  const updateInteraction = useMutation(api.sales.interactions.mutations.updateInteraction);

  const { 
    handleSubmit, 
    control, 
    reset,
    setValue,
    formState: { isSubmitting } 
  } = useForm<FormValues>({
    resolver: zodResolver(updateInteractionStatusSchema as never),
    defaultValues: {
      status: interaction.status,
      outcome: interaction.outcome,
      brief: interaction.brief || "",
    },
  });

  const interactionStatus = useWatch({ control, name: "status" });

  useEffect(() => {
    if (interactionStatus !== "completed") {
      setValue("outcome", undefined);
      setValue("brief", "");
    }
  }, [interactionStatus, setValue]);

  const onSubmit = async (data: FormValues) => {
    try {
      await updateInteraction({
        interactionId: interaction._id,
        status: data.status,
        outcome: data.outcome,
        brief: data.brief || undefined,
      });

      toast.success("Interaction status updated");
      onOpenChange(false);
      reset();
    } catch (error) {
      console.error(error);
      toast.error("Error updating status");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="p-0 w-[95vw] sm:max-w-2xl rounded-xl overflow-hidden">
        <DialogHeader className="p-3 border-b bg-accent">
          <div className="flex items-center gap-3">
            <div className="text-foreground">
              <MessageSquare className="h-5 w-5" />
            </div>
            <div>
              <DialogTitle className="text-lg font-black tracking-tight uppercase">Interaction Outcome</DialogTitle>
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
                  name="status"
                  render={({ field, fieldState }) => (
                    <Field className="space-y-1.5" data-invalid={fieldState.invalid}>
                      <FieldLabel className="text-[10px] font-black text-muted-foreground uppercase tracking-wider">Final Status</FieldLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <SelectTrigger className="w-full bg-secondary/20 border-border/40 text-foreground">
                          <SelectValue placeholder="Select" />
                        </SelectTrigger>
                        <SelectContent className="w-full">
                          <SelectGroup>
                            <SelectLabel className="text-[10px] font-black text-muted-foreground uppercase tracking-wider">Status</SelectLabel>
                            <SelectItem value="completed" className="text-emerald-500 font-medium">Completed</SelectItem>
                            <SelectItem value="missed" className="text-amber-500 font-medium">Missed</SelectItem>
                            <SelectItem value="no_response" className="text-destructive font-medium">No response</SelectItem>
                            <SelectItem value="scheduled" className="text-blue-500 font-medium">Scheduled</SelectItem>
                          </SelectGroup>
                        </SelectContent>
                      </Select>
                      {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                    </Field>
                  )}
                />

                <Controller
                  control={control}
                  name="outcome"
                  render={({ field, fieldState }) => (
                    <Field className="space-y-1.5" data-invalid={fieldState.invalid}>
                      <FieldLabel className="text-[10px] font-black text-muted-foreground uppercase tracking-wider">Outcome / Feeling</FieldLabel>
                      <Select 
                        onValueChange={field.onChange} 
                        value={field.value}
                        disabled={interactionStatus !== "completed"}
                      >
                        <SelectTrigger className="w-full bg-secondary/20 border-border/40 text-foreground">
                          <SelectValue placeholder="Optional" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectGroup>
                            <SelectLabel className="text-[10px] font-black text-muted-foreground uppercase tracking-wider">Outcome</SelectLabel>
                            <SelectItem value="positive" className="text-emerald-500 font-medium">Positive (+)</SelectItem>
                            <SelectItem value="neutral" className="text-slate-500 font-medium">Neutral (=)</SelectItem>
                            <SelectItem value="negative" className="text-destructive font-medium">Negative (-)</SelectItem>
                          </SelectGroup>
                        </SelectContent>
                      </Select>
                      {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                    </Field>
                  )}
                />
              </div>

              <Controller
                control={control}
                name="brief"
                render={({ field, fieldState }) => (
                  <Field className="space-y-1.5" data-invalid={fieldState.invalid}>
                    <FieldLabel className="text-[10px] font-black text-muted-foreground uppercase tracking-wider">Brief (Minutes)</FieldLabel>
                    <Textarea 
                      {...field}
                      placeholder="Summary of exchanges, key points, decisions..." 
                      className="min-h-25 font-medium bg-secondary/20 border-border/40 resize-none text-foreground"
                      aria-invalid={fieldState.invalid}
                      disabled={interactionStatus !== "completed"}
                    />
                    {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                  </Field>
                )}
              />
            </div>
          </div>

          <DialogFooter className="bg-accent border-t p-2!">
            <Button variant="outline" type="button" onClick={() => reset()}>Reset</Button>
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
              Save
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
