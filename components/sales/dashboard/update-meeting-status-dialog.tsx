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
import { Field, FieldContent, FieldError, FieldLabel } from "@/components/ui/field";
import { ClipboardCheck } from "lucide-react";
import { Spinner } from "@/components/ui/spinner";
import { toast } from "sonner";
import { useEffect } from "react";

const updateStatusSchema = z.object({
  status: z.enum(["scheduled", "completed", "missed", "cancelled"]),
  outcome: z.enum(["positive", "neutral", "negative"]).optional(),
  brief: z.string().optional(),
});

type FormValues = z.infer<typeof updateStatusSchema>;

interface UpdateMeetingStatusDialogProps {
  meeting: {
    _id: Id<"clientMeetings">;
    status: "scheduled" | "completed" | "missed" | "cancelled";
    outcome?: "positive" | "neutral" | "negative";
    brief?: string;
    client?: { companyName: string } | null;
  };
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function UpdateMeetingStatusDialog({ meeting, open, onOpenChange }: UpdateMeetingStatusDialogProps) {
  const updateStatus = useMutation(api.sales.meetings.mutations.updateMeetingStatus);

  const { 
    control, 
    handleSubmit, 
    setValue,
    reset,
    formState: { errors, isSubmitting } 
  } = useForm<FormValues>({
    resolver: zodResolver(updateStatusSchema as never),
    defaultValues: {
      status: meeting.status,
      outcome: meeting.outcome,
      brief: meeting.brief || "",
    },
  });

  const meetingStatus = useWatch({ control, name: "status" });

  useEffect(() => {
    if (meetingStatus !== "completed") {
      setValue("outcome", undefined);
      setValue("brief", "");
    }
  }, [meetingStatus, setValue]);

  const onSubmit = async (data: FormValues) => {
    try {
      await updateStatus({
        meetingId: meeting._id,
        status: data.status,
        outcome: data.outcome,
        brief: data.brief,
      });

      toast.success("Meeting status updated");
      onOpenChange(false);
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
              <ClipboardCheck className="h-5 w-5" />
            </div>
            <div>
              <DialogTitle className="text-lg font-black tracking-tight uppercase">Meeting Outcome</DialogTitle>
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mt-0.5">
                Client: <span className="text-foreground font-black">{meeting.client?.companyName || "Unknown Client"}</span>
              </p>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="max-h-[60vh] overflow-y-auto pr-1">
            <div className="px-3 pt-3 pb-4 space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Field className="space-y-1.5">
                  <FieldLabel className="text-[10px] font-black text-muted-foreground uppercase tracking-wider">Final Status</FieldLabel>
                  <FieldContent>
                    <Controller
                      control={control}
                      name="status"
                      render={({ field }) => (
                        <Select onValueChange={field.onChange} value={field.value}>
                          <SelectTrigger className="w-full bg-secondary/20 border-border/40 text-foreground">
                            <SelectValue placeholder="Select" />
                          </SelectTrigger>
                          <SelectContent className="w-full">
                            <SelectGroup>
                              <SelectLabel className="text-[10px] font-black text-muted-foreground uppercase tracking-wider">Status</SelectLabel>
                              <SelectItem value="completed" className="text-emerald-500 font-medium">Completed</SelectItem>
                              <SelectItem value="missed" className="text-amber-500 font-medium">Missed</SelectItem>
                              <SelectItem value="cancelled" className="text-destructive font-medium">Cancelled</SelectItem>
                              <SelectItem value="scheduled" className="text-blue-500 font-medium">Scheduled</SelectItem>
                            </SelectGroup>
                          </SelectContent>
                        </Select>
                      )}
                    />
                    <FieldError errors={[errors.status]} />
                  </FieldContent>
                </Field>

                <Field className="space-y-1.5">
                  <FieldLabel className="text-[10px] font-black text-muted-foreground uppercase tracking-wider">Outcome / Feeling</FieldLabel>
                  <FieldContent>
                    <Controller
                      control={control}
                      name="outcome"
                      render={({ field }) => (
                        <Select 
                          onValueChange={field.onChange} 
                          value={field.value}
                          disabled={meetingStatus !== "completed"}
                        >
                          <SelectTrigger className="w-full bg-secondary/20 border-border/40 text-foreground">
                            <SelectValue placeholder="Optional" />
                          </SelectTrigger>
                          <SelectContent className="w-full">
                            <SelectGroup>
                              <SelectLabel className="text-[10px] font-black text-muted-foreground uppercase tracking-wider">Outcome</SelectLabel>
                              <SelectItem value="positive" className="text-emerald-500 font-medium">Positive (+)</SelectItem>
                              <SelectItem value="neutral" className="text-slate-500 font-medium">Neutral (=)</SelectItem>
                              <SelectItem value="negative" className="text-destructive font-medium">Negative (-)</SelectItem>
                            </SelectGroup>
                          </SelectContent>
                        </Select>
                      )}
                    />
                    <FieldError errors={[errors.outcome]} />
                  </FieldContent>
                </Field>
              </div>

              <Field className="space-y-1.5">
                <FieldLabel className="text-[10px] font-black text-muted-foreground uppercase tracking-wider">Brief (Minutes)</FieldLabel>
                <FieldContent>
                  <Controller
                    control={control}
                    name="brief"
                    render={({ field }) => (
                      <Textarea 
                        {...field}
                        placeholder="Summary of exchanges, key points, decisions..." 
                        className="min-h-25 font-medium bg-secondary/20 border-border/40 resize-none text-foreground"
                        disabled={meetingStatus !== "completed"}
                      />
                    )}
                  />
                  <FieldError errors={[errors.brief]} />
                </FieldContent>
              </Field>
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
