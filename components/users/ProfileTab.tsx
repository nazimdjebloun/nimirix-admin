import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { updateProfileSchema, type UpdateProfileFormValues } from "@/lib/validations/user";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { AlertCircle, CheckCircle2 } from "lucide-react";
import { Spinner } from "../ui/spinner";
import { useState } from "react";
import { authClient } from "@/lib/auth-client";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface ProfileTabProps {
  currentName: string;
}

export default function ProfileTab({ currentName }: ProfileTabProps) {
  const [isPending, setIsPending] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { isDirty, isValid, errors },
  } = useForm<UpdateProfileFormValues>({
    resolver: zodResolver(updateProfileSchema),
    mode: "onChange",
    defaultValues: {
      name: currentName,
    },
  });

  const onSubmit = async (values: UpdateProfileFormValues) => {
    setIsPending(true);
    setSuccess(false);
    setError(null);
    try {
      const { error } = await authClient.updateUser({
        name: values.name.trim(),
      });
      
      if (error) {
        throw new Error(error.message || "Failed to update profile");
      }
      
      setSuccess(true);
      reset({ name: values.name.trim() });
      toast.success("Profile updated successfully!");
    } catch (err: unknown) {
      console.error("[ProfileTab Error]:", err);
      const message = err instanceof Error ? err.message : "An error occurred";
      setError(message);
      toast.error(message);
    } finally {
      setIsPending(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-4">
      {success && (
        <Alert className="bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-400">
          <CheckCircle2 className="h-4 w-4" />
          <AlertTitle>Success</AlertTitle>
          <AlertDescription>Your profile has been updated successfully.</AlertDescription>
        </Alert>
      )}

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="space-y-2">
        <Label htmlFor="profile-name" className={`text-sm font-bold px-1 ${errors.name ? 'text-destructive' : ''}`}>Name</Label>
        <Input
          id="profile-name"
          placeholder="Your name"
          className={`rounded-xl ${errors.name ? 'border-destructive focus-visible:ring-destructive/20' : ''}`}
          {...register("name")}
        />
        {errors.name && (
          <p className="text-[10px] text-destructive font-medium px-1 flex items-center gap-1">
            <AlertCircle className="h-3 w-3" />
            {errors.name.message}
          </p>
        )}
      </div>
      <Button
        type="submit"
        disabled={isPending || !isDirty || !isValid}
        className="w-full rounded-xl transition-all active:scale-[0.98]"
      >
        {isPending ? (
          <>
            <Spinner />
            Saving...
          </>
        ) : (
          "Save"
        )}
      </Button>
    </form>
  );
}
