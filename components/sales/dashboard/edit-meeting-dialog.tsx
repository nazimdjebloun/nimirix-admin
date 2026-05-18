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
import { Edit2 } from "lucide-react";
import { Spinner } from "@/components/ui/spinner";
import { toast } from "sonner";
import { DatePicker } from "@/components/shared/date-picker";
import { useState } from "react";
import { DeleteMeetingAlertDialog } from "./delete-meeting-alert-dialog";

const editMeetingSchema = z.object({
  scheduledAtDate: z.string().min(1, "La date est requise"),
  scheduledAtTime: z.string().min(1, "L'heure est requise"),
  type: z.enum(["in_office", "remote", "client_office"]),
  location: z.string().optional(),
  notes: z.string().optional(),
});

type FormValues = z.infer<typeof editMeetingSchema>;

interface EditMeetingDialogProps {
  meeting: Doc<"clientMeetings"> & { client?: { companyName: string } | null };
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EditMeetingDialog({ meeting, open, onOpenChange }: EditMeetingDialogProps) {
  const updateMeeting = useMutation(api.sales.meetings.mutations.updateMeeting);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const { 
    handleSubmit, 
    control, 
    reset,
    formState: { errors, isSubmitting } 
  } = useForm<FormValues>({
    resolver: zodResolver(editMeetingSchema as never),
    defaultValues: {
      type: meeting.type,
      scheduledAtDate: new Date(meeting.scheduledAt).toISOString().split('T')[0],
      scheduledAtTime: new Date(meeting.scheduledAt).toTimeString().slice(0, 5),
      location: meeting.location || "",
      notes: meeting.notes || "",
    },
  });

  const meetingType = useWatch({ control, name: "type" });

  const onSubmit = async (data: FormValues) => {
    try {
      const scheduledAt = new Date(`${data.scheduledAtDate}T${data.scheduledAtTime}`).getTime();
      
      await updateMeeting({
        meetingId: meeting._id,
        scheduledAt,
        type: data.type,
        location: data.location || undefined,
        notes: data.notes || undefined,
      });

      toast.success("Meeting updated successfully");
      onOpenChange(false);
    } catch (error) {
      console.error(error);
      toast.error("Error updating meeting");
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
                <DialogTitle className="text-lg font-black tracking-tight uppercase">Edit Meeting</DialogTitle>
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
                    <FieldLabel className="text-[10px] font-black text-muted-foreground uppercase tracking-wider">Date</FieldLabel>
                    <Controller
                      control={control}
                      name="scheduledAtDate"
                      render={({ field }) => (
                        <DatePicker
                          value={field.value} 
                          onChange={field.onChange}
                        />
                      )}
                    />
                    <FieldError errors={[errors.scheduledAtDate]} />
                  </Field>

                  <Field className="space-y-1.5">
                    <FieldLabel className="text-[10px] font-black text-muted-foreground uppercase tracking-wider">Time</FieldLabel>
                    <Controller
                      control={control}
                      name="scheduledAtTime"
                      render={({ field }) => (
                        <Input 
                          type="time" 
                          {...field}
                          className="bg-background border-border/40 focus-visible:ring-primary/20 text-foreground font-medium"
                        />
                      )}
                    />
                    <FieldError errors={[errors.scheduledAtTime]} />
                  </Field>
                </div>

                <Field className="space-y-1.5">
                  <FieldLabel className="text-[10px] font-black text-muted-foreground uppercase tracking-wider">Meeting Type</FieldLabel>
                  <Controller
                    control={control}
                    name="type"
                    render={({ field }) => (
                      <Select onValueChange={field.onChange} value={field.value}>
                        <SelectTrigger className="w-full bg-secondary/20 border-border/40 focus-visible:ring-primary/20 text-foreground">
                          <SelectValue placeholder="Select Meeting Type" />
                        </SelectTrigger>
                        <SelectContent className="w-full">
                          <SelectGroup>
                            <SelectLabel className="text-[10px] font-black text-muted-foreground uppercase tracking-wider">Type</SelectLabel>
                            <SelectItem value="remote" className="font-medium">Video Conference (Remote)</SelectItem>
                            <SelectItem value="in_office" className="font-medium">At Office (nimirix)</SelectItem>
                            <SelectItem value="client_office" className="font-medium">At Client&apos;s Office</SelectItem>
                          </SelectGroup>
                        </SelectContent>
                      </Select>
                    )}
                  />
                  <FieldError errors={[errors.type]} />
                </Field>

                {meetingType !== "remote" && (
                  <Field className="space-y-1.5 animate-in fade-in slide-in-from-top-1 duration-200">
                    <FieldLabel className="text-[10px] font-black text-muted-foreground uppercase tracking-wider">Location / Address</FieldLabel>
                    <Controller
                      control={control}
                      name="location"
                      render={({ field }) => (
                        <Input 
                          {...field}
                          placeholder={meetingType === "in_office" ? "nimirix Office" : "Client's address..."}
                          className="bg-secondary/20 border-border/40 focus-visible:ring-primary/20 text-foreground font-medium" 
                        />
                      )}
                    />
                    <FieldError errors={[errors.location]} />
                  </Field>
                )}

                <Field className="space-y-1.5">
                  <FieldLabel className="text-[10px] font-black text-muted-foreground uppercase tracking-wider">Notes / Agenda</FieldLabel>
                  <Controller
                    control={control}
                    name="notes"
                    render={({ field }) => (
                      <Textarea 
                        {...field}
                        placeholder="Meeting details..." 
                        className="min-h-25 font-medium bg-secondary/20 border-border/40 focus-visible:ring-primary/20 resize-none text-foreground"
                      />
                    )}
                  />
                  <FieldError errors={[errors.notes]} />
                </Field>
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

      <DeleteMeetingAlertDialog
        meeting={meeting}
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onSuccess={() => onOpenChange(false)}
      />
    </>
  );
}
