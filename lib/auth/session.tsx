import {  Monitor, Laptop, Smartphone} from "lucide-react";
import { cn } from "@/lib/utils";

export function parseUserAgent(ua: string): string {
    if (!ua) return "Appareil inconnu";

    // Order matters: most specific first
    const browser =
        ua.includes("Edg/")     ? `Edge ${ua.match(/Edg\/([\d]+)/)?.[1] ?? ""}` :
        ua.includes("OPR/")     ? `Opera ${ua.match(/OPR\/([\d]+)/)?.[1] ?? ""}` :
        ua.includes("Firefox/") ? `Firefox ${ua.match(/Firefox\/([\d]+)/)?.[1] ?? ""}` :
        ua.includes("Chrome/")  ? `Chrome ${ua.match(/Chrome\/([\d]+)/)?.[1] ?? ""}` :
        ua.includes("Safari/") && ua.includes("Version/") ? `Safari ${ua.match(/Version\/([\d]+)/)?.[1] ?? ""}` :
        "Navigateur inconnu";

    const os =
        ua.includes("Windows NT 10.0") ? "Windows 10/11" :
        ua.includes("Windows")         ? "Windows" :
        ua.includes("Mac OS X")        ? "macOS" :
        ua.includes("Android")         ? `Android ${ua.match(/Android ([\d.]+)/)?.[1] ?? ""}` :
        ua.includes("iPhone")          ? "iPhone" :
        ua.includes("iPad")            ? "iPad" :
        ua.includes("Linux")           ? "Linux" :
        "OS inconnu";

    return `${browser} — ${os}`;
}


export function formatIP(ip: string | null | undefined): string {
    if (!ip) return "Inconnue";
    // IPv6 all-zeros is localhost
    if (/^[0:]+$/.test(ip) || ip === "::1" || ip === "::") return "Localhost";
    return ip;
}


export function DeviceIcon({ userAgent, className }: { userAgent: string, className?: string }) {
    if (/mobile/i.test(userAgent)) return <Smartphone className={cn("h-4 w-4", className)} />;
    if (/tablet|ipad/i.test(userAgent)) return <Monitor className={cn("h-4 w-4", className)} />;
    return <Laptop className={cn("h-4 w-4", className)} />;
}