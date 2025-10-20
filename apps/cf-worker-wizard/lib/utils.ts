import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getClientIP(reqHeaders: Headers) {
  const xff = reqHeaders.get("x-forwarded-for");
  const realIp = reqHeaders.get("x-real-ip");
  return (xff?.split(",")[0]?.trim() || realIp || "unknown");
}
