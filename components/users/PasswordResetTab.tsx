import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { changePasswordSchema, type ChangePasswordFormValues } from "@/lib/validations/auth";
import { authClient } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Eye, EyeOff, AlertCircle, CheckCircle2 } from "lucide-react";
import { Spinner } from "@/components/ui/spinner";
import { useState } from "react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface PasswordResetTabProps {
    onPasswordChanged: () => void;
}

export default function PasswordResetTab({ onPasswordChanged }: PasswordResetTabProps) {
    const [showCurrentPassword, setShowCurrentPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [isPending, setIsPending] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const {
        register,
        handleSubmit,
        reset,
        formState: { errors, isValid, isDirty },
    } = useForm<ChangePasswordFormValues>({
        resolver: zodResolver(changePasswordSchema),
        mode: "onChange",
        defaultValues: {
            currentPassword: "",
            newPassword: "",
            confirmPassword: "",
        },
    });

    const onSubmit = async (values: ChangePasswordFormValues) => {
        setIsPending(true);
        setSuccess(false);
        setError(null);
        try {
            const { error } = await authClient.changePassword({
                currentPassword: values.currentPassword,
                newPassword: values.newPassword,
                revokeOtherSessions: true,
            });

            if (error) {
                if (error.code === "INVALID_PASSWORD") {
                    throw new Error("Incorrect current password.");
                }
                throw new Error(error.message || "An error occurred.");
            }

            setSuccess(true);
            toast.success("Password changed — other sessions have been revoked");
            reset();
            onPasswordChanged();
        } catch (err: unknown) {
            console.error("[PasswordResetTab Error]:", err);
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
                    <AlertDescription>Your password has been changed and other sessions revoked.</AlertDescription>
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
                <Label htmlFor="currentPassword" className={`text-sm font-bold px-1 ${errors.currentPassword ? 'text-destructive' : ''}`}>Current Password</Label>
                <div className="relative">
                    <Input
                        id="currentPassword"
                        type={showCurrentPassword ? "text" : "password"}
                        autoComplete="current-password"
                        className={`pr-10 rounded-xl ${errors.currentPassword ? 'border-destructive focus-visible:ring-destructive/20' : ''}`}
                        {...register("currentPassword")}
                    />
                    <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent text-muted-foreground hover:text-foreground rounded-r-xl"
                        onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                        tabIndex={-1}
                    >
                        {showCurrentPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                </div>
                {errors.currentPassword && (
                    <p className="text-[10px] text-destructive font-medium px-1 flex items-center gap-1">
                        <AlertCircle className="h-3 w-3" />
                        {errors.currentPassword.message}
                    </p>
                )}
            </div>

            <div className="space-y-2">
                <Label htmlFor="newPassword" className={`text-sm font-bold px-1 ${errors.newPassword ? 'text-destructive' : ''}`}>New Password</Label>
                <div className="relative">
                    <Input
                        id="newPassword"
                        type={showNewPassword ? "text" : "password"}
                        autoComplete="new-password"
                        className={`pr-10 rounded-xl ${errors.newPassword ? 'border-destructive focus-visible:ring-destructive/20' : ''}`}
                        {...register("newPassword")}
                    />
                    <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent text-muted-foreground hover:text-foreground rounded-r-xl"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                        tabIndex={-1}
                    >
                        {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                </div>
                {errors.newPassword && (
                    <p className="text-[10px] text-destructive font-medium px-1 flex items-center gap-1">
                        <AlertCircle className="h-3 w-3" />
                        {errors.newPassword.message}
                    </p>
                )}
            </div>

            <div className="space-y-2">
                <Label htmlFor="confirmPassword" className={`text-sm font-bold px-1 ${errors.confirmPassword ? 'text-destructive' : ''}`}>Confirm New Password</Label>
                <div className="relative">
                    <Input
                        id="confirmPassword"
                        type={showConfirmPassword ? "text" : "password"}
                        autoComplete="new-password"
                        className={`pr-10 rounded-xl ${errors.confirmPassword ? 'border-destructive focus-visible:ring-destructive/20' : ''}`}
                        {...register("confirmPassword")}
                    />
                    <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent text-muted-foreground hover:text-foreground rounded-r-xl"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        tabIndex={-1}
                    >
                        {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                </div>
                {errors.confirmPassword && (
                    <p className="text-[10px] text-destructive font-medium px-1 flex items-center gap-1">
                        <AlertCircle className="h-3 w-3" />
                        {errors.confirmPassword.message}
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
                        <Spinner className="mr-2" />
                        Changing...
                    </>
                ) : (
                    "Change Password"
                )}
            </Button>
        </form>
    );
}

