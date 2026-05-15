"use client";

import { authClient } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";
import { useState } from "react";

interface LogoutButtonProps {
    className?: string;
    variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";
    size?: "default" | "sm" | "lg" | "icon";
    showText?: boolean;
}

export function LogoutButton({ 
    className, 
    variant = "destructive", 
    size = "sm", 
    showText = true 
}: LogoutButtonProps) {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);

    const handleLogout = async () => {
        try {
            setIsLoading(true);
            await authClient.signOut({
                fetchOptions: {
                    onSuccess: () => {
                        router.push("/login");
                    },
                },
            });
        } catch (error) {
            console.error("Logout error:", error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Button 
            variant={variant} 
            size={size} 
            className={className} 
            onClick={handleLogout}
            disabled={isLoading}
        >
            <LogOut className="h-4 w-4 mr-2" />
            {showText && (isLoading ? "Loging out..." : "Logout")}
        </Button>
    );
}
