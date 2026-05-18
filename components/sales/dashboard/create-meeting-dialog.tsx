"use client";

import { useForm, Controller, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import  z from "zod";
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
import { Calendar } from "lucide-react";
import { toast } from "sonner";
import ClientMeetingList from "@/components/sales/dashboard/client-meeting-list";
import { Spinner } from "@/components/ui/spinner";

const createMeetingSchema = z.object({
  scheduledAtDate: z.string().min(1, "Date is required"),
  scheduledAtTime: z.string().min(1, "Time is required"),
  type: z.enum(["in_office", "remote", "client_office"]),
  location: z.string().optional(),
  notes: z.string().min(1, "Notes are required"),
});

type FormValues = z.infer<typeof createMeetingSchema>;

interface CreateMeetingDialogProps {
  clientId: Id<"clients">;
  companyName: string;
  open: boolean
  onOpenChange: (open: boolean) => void;
}

export function CreateMeetingDialog({ clientId, companyName, open, onOpenChange }: CreateMeetingDialogProps) {
  const createMeeting = useMutation(api.sales.meetings.mutations.createMeeting);

  const {
    handleSubmit,
    control,
    reset,
    formState: { isSubmitting }
  } = useForm<FormValues>({
    resolver: zodResolver(createMeetingSchema as never),
    defaultValues: {
      type: "in_office",
      scheduledAtDate: new Date().toISOString().split('T')[0],
      scheduledAtTime: new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' }),
      location: "",
      notes: "",
    },
  });

  const meetingType = useWatch({ control, name: "type" });

  const onSubmit = async (data: FormValues) => {
    try {
      const scheduledAt = new Date(`${data.scheduledAtDate}T${data.scheduledAtTime}`).getTime();

      await createMeeting({
        clientId,
        scheduledAt,
        type: data.type,
        location: data.location || undefined,
        notes: data.notes || undefined,
        status: "scheduled",
      });
      toast.success("Meeting scheduled successfully");
      onOpenChange(false);
      reset();
    } catch (error) {
      console.error(error);
      toast.error("Error scheduling meeting");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="p-0 w-[95vw] sm:max-w-2xl rounded-xl overflow-hidden">
        <DialogHeader className="p-3 border-b bg-accent">
          <div className="flex items-center gap-3">
            <div className="text-foreground">
              <Calendar className="h-5 w-5" />
            </div>
            <div>
              <DialogTitle className="text-lg font-black tracking-tight uppercase">Schedule Meeting</DialogTitle>
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mt-0.5">
                Client: <span className="text-foreground font-black">{companyName}</span>
              </p>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="max-h-[60vh] overflow-y-auto pr-1">
            <div className="px-2 pt-2">
              <ClientMeetingList clientId={clientId} />
            </div>
            <div className="px-3 py-4 space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Controller
                  control={control}
                  name="scheduledAtDate"
                  render={({ field, fieldState }) => (
                    <Field className="space-y-1.5" data-invalid={fieldState.invalid}>
                      <FieldLabel htmlFor="scheduledAtDate" className="text-[10px] font-black text-muted-foreground uppercase tracking-wider">Date</FieldLabel>
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
                      <FieldLabel htmlFor="scheduledAtTime" className="text-[10px] font-black text-muted-foreground uppercase tracking-wider">Time</FieldLabel>
                      <Input
                        {...field}
                        id="scheduledAtTime"
                        type="time"
                        aria-invalid={fieldState.invalid}
                        className="bg-background text-foreground"
                      />
                      {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                    </Field>
                  )}
                />
              </div>

              <Controller
                control={control}
                name="type"
                render={({ field, fieldState }) => (
                  <Field className="space-y-1.5" data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="type" className="text-[10px] font-black text-muted-foreground uppercase tracking-wider">Meeting Type</FieldLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <SelectTrigger id="type" className="w-full " aria-invalid={fieldState.invalid}>
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          <SelectLabel className="text-[10px] font-black text-muted-foreground uppercase tracking-wider">Meeting Type</SelectLabel>
                          <SelectItem value="remote" className="text-xs">Video Conference</SelectItem>
                          <SelectItem value="in_office" className="text-xs">In Office (Nimirix)</SelectItem>
                          <SelectItem value="client_office" className="text-xs">Client Office</SelectItem>
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                    {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                  </Field>
                )}
              />

              {meetingType !== undefined && meetingType !== "remote" && meetingType !== "in_office" && (
                <Controller
                  control={control}
                  name="location"
                  render={({ field, fieldState }) => (
                    <Field className="space-y-1.5 animate-in fade-in slide-in-from-top-1 duration-200" data-invalid={fieldState.invalid}>
                      <FieldLabel htmlFor="location" className="text-[10px] font-black text-muted-foreground uppercase tracking-wider">Location / Address</FieldLabel>
                      <Input
                        {...field}
                        id="location"
                        placeholder="Client address..."
                        aria-invalid={fieldState.invalid}
                        className="h-9 font-bold bg-secondary/20 border-border/40 focus-visible:ring-primary/20 text-foreground"
                      />
                      {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                    </Field>
                  )}
                />
              )}

              <Controller
                control={control}
                name="notes"
                render={({ field, fieldState }) => (
                  <Field className="space-y-1" data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="notes" className="text-[10px] font-black text-muted-foreground uppercase tracking-wider">Notes / Agenda</FieldLabel>
                    <Textarea
                      {...field}
                      id="notes"
                      placeholder="Meeting details..."
                      aria-invalid={fieldState.invalid}
                      className="font-medium bg-secondary/20 border-border/40 resize-none text-foreground"
                      autoComplete="off"
                    />
                    {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                  </Field>
                )}
              />
            </div>
          </div>

          <DialogFooter className="bg-accent border-t p-2!">
            <Button variant="outline" type="button" onClick={() => reset({
              type: "in_office",
              scheduledAtDate: new Date().toISOString().split('T')[0],
              scheduledAtTime: new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' }),
              location: "",
              notes: "",
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
              Confirm meeting
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>

  );
}
