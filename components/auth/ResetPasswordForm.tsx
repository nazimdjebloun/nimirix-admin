"use client";

import { useState, Suspense } from "react";
import { authClient } from "@/lib/auth-client";
import { useSearchParams, useRouter } from "next/navigation";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Button } from "../ui/button";
import { Spinner } from "../ui/spinner";
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Eye, EyeOff } from "lucide-react";


function ResetPasswordFormInner() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const token = searchParams.get("token");

    const [password, setPassword] = useState<string>("");
    const [confirmPassword, setConfirmPassword] = useState<string>("");
    const [showPassword, setShowPassword] = useState<boolean>(false);
    const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
        e.preventDefault();
        
        if (!token) {
            setStatus("error");
            setErrorMessage("Missing reset token.");
            return;
        }

        if (password !== confirmPassword) {
            setStatus("error");
            setErrorMessage("Passwords do not match.");
            return;
        }

        setStatus("loading");
        setErrorMessage(null);

        try {
            const { error } = await authClient.resetPassword({
                newPassword: password,
                token: token,
            });

            if (error) {
                if (error.code === "INVALID_TOKEN") {
                    setErrorMessage("The reset link is invalid. Please check the URL or request a new one.");
                } else if (error.code === "EXPIRED_TOKEN") {
                    setErrorMessage("The reset link has expired. Please request a new one.");
                } else {
                    setErrorMessage(error.message || "An error occurred during password reset.");
                }
                setStatus("error");
            } else {
                setStatus("success");
                // Redirect to login after a short delay
                setTimeout(() => {
                    router.push("/login");
                }, 3000);
            }
        } catch (err) {
            setStatus("error");
            setErrorMessage("An unexpected error occurred.");
            console.error(err);
        }
    };

    if (!token) {
        return (
            <Card className="w-full max-w-md shadow-none border-destructive">
                <CardHeader>
                    <CardTitle className="text-2xl font-bold text-destructive">Error</CardTitle>
                    <CardDescription>
                        The reset link is invalid or has expired.
                    </CardDescription>
                </CardHeader>
                <CardFooter>
                    <Button variant="outline" className="w-full" onClick={() => router.push("/forgot-password")}>
                        Request a new link
                    </Button>
                </CardFooter>
            </Card>
        );
    }

    if (status === "success") {
        return (
            <Card className="w-full max-w-md shadow-none border-green-500">
                <CardHeader>
                    <CardTitle className="text-2xl font-bold text-green-600 text-center">Success</CardTitle>
                    <CardDescription className="text-center">
                        Your password has been successfully reset. Redirecting to login...
                    </CardDescription>
                </CardHeader>
                <CardContent className="flex justify-center">
                    <Spinner className="h-8 w-8 text-green-500" />
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className="w-full max-w-md shadow-none">
            <CardHeader>
                <CardTitle className="text-2xl font-bold">Reset Password</CardTitle>
                <CardDescription>
                    Choose a new secure password for your account.
                </CardDescription>
            </CardHeader>
            <form onSubmit={handleSubmit} className="space-y-6">
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="password">New Password</Label>
                        <div className="relative">
                            <Input
                                id="password"
                                type={showPassword ? "text" : "password"}
                                placeholder="••••••••"
                                value={password}
                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
                                required
                                minLength={8}
                                className="pr-10"
                            />
                            <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent text-muted-foreground hover:text-foreground"
                                onClick={() => setShowPassword(!showPassword)}
                                tabIndex={-1}
                            >
                                {showPassword ? (
                                    <EyeOff className="h-4 w-4" />
                                ) : (
                                    <Eye className="h-4 w-4" />
                                )}
                            </Button>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="confirmPassword">Confirm Password</Label>
                        <Input
                            id="confirmPassword"
                            type={showPassword ? "text" : "password"}
                            placeholder="••••••••"
                            value={confirmPassword}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setConfirmPassword(e.target.value)}
                            required
                        />
                    </div>
                </CardContent>
                <CardFooter className="flex flex-col gap-4">
                    <Button type="submit" disabled={status === "loading"} className="w-full">
                        {status === "loading" ? (
                            <>
                                <Spinner className="mr-2 h-4 w-4" /> Resetting...
                            </>
                        ) : (
                            "Reset Password"
                        )}
                    </Button>
                    {status === "error" && errorMessage && (
                        <Alert variant="destructive">
                            <AlertDescription>{errorMessage}</AlertDescription>
                        </Alert>
                    )}
                </CardFooter>
            </form>
        </Card>
    );
}

/**
 * Main form component wrapped in Suspense for useSearchParams.
 */
export function ResetPasswordForm() {
    return (
        <Suspense fallback={<Spinner className="h-8 w-8" />}>
            <ResetPasswordFormInner />
        </Suspense>
    );
}
