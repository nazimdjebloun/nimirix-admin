"use client";

import { useState } from "react";
import { authClient } from "@/lib/auth-client";
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
import Link from "next/link";

/**
 * Form to handle "Forgot Password" requests.
 * It sends a reset link to the provided email address.
 */
export function ForgotPasswordForm() {
    const [email, setEmail] = useState<string>("");
    const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
        e.preventDefault();
        setStatus("loading");
        setErrorMessage(null);

        try {
            const { error } = await authClient.requestPasswordReset({
                email,
                redirectTo: "/reset-password",
            });

            if (error) {
                // If the user is not found, we still show the success message
                // to prevent email enumeration.
                if (error.code === "USER_NOT_FOUND") {
                    setStatus("success");
                    return;
                }

                if (error.code === "TOO_MANY_REQUESTS") {
                    setStatus("error");
                    setErrorMessage("Too many requests. Please try again in a minute.");
                    return;
                }
                
                setStatus("error");
                setErrorMessage(error.message || "An error occurred while sending the email.");
            } else {
                setStatus("success");
            }
        } catch (err) {
            setStatus("error");
            setErrorMessage("An unexpected error occurred.");
            console.error(err);
        }
    };

    if (status === "success") {
        return (
            <Card className="w-full max-w-md shadow-none">
                <CardHeader>
                    <CardTitle className="text-2xl font-bold text-center">Email Sent</CardTitle>
                    <CardDescription className="text-center">
                        If an account is associated with this address, you will receive a reset link shortly.
                    </CardDescription>
                </CardHeader>
                <CardFooter>
                    <Link href="/login" aria-label="Back to login" className="w-full">
                        <Button variant="outline" className="w-full">
                            Back to Login
                        </Button>
                    </Link>
                </CardFooter>
            </Card>
        );
    }

    return (
        <Card className="w-full max-w-md shadow-none">
            <CardHeader>
                <CardTitle className="text-2xl font-bold">Forgot Password</CardTitle>
                <CardDescription>
                    Enter your email address to receive a password reset link.
                </CardDescription>
            </CardHeader>
            <form onSubmit={handleSubmit} className="space-y-6">
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="email">Email Address</Label>
                        <Input
                            id="email"
                            type="email"
                            placeholder="name@example.com"
                            value={email}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
                            required
                        />
                    </div>
                </CardContent>
                <CardFooter className="flex flex-col gap-4">
                    <Button type="submit" disabled={status === "loading"} aria-label={status === "loading" ? "Sending..." : "Send Reset Link"} className="w-full">
                        {status === "loading" ? (
                            <>
                                <Spinner className="mr-2 h-4 w-4" /> Sending...
                            </>
                        ) : (
                            "Send Reset Link"
                        )}
                    </Button>
                    {status === "error" && errorMessage && (
                        <Alert variant="destructive">
                            <AlertDescription>{errorMessage}</AlertDescription>
                        </Alert>
                    )}
                    <Link href="/login" aria-label="Back to login" className="text-center w-full text-primary-foreground hover:underline">
                        Back to Login
                    </Link>
                </CardFooter>
            </form>
        </Card>
    );
}
