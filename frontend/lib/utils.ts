import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatAddress(address: string): string {
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

export function formatElo(elo: number): string {
  if (elo >= 2400) return "Grandmaster";
  if (elo >= 2000) return "Master";
  if (elo >= 1600) return "Expert";
  if (elo >= 1200) return "Advanced";
  if (elo >= 800) return "Intermediate";
  return "Beginner";
}

export function getEloColor(elo: number): string {
  if (elo >= 2400) return "text-yellow-500";
  if (elo >= 2000) return "text-orange-500";
  if (elo >= 1600) return "text-purple-500";
  if (elo >= 1200) return "text-blue-500";
  if (elo >= 800) return "text-green-500";
  return "text-gray-500";
}
