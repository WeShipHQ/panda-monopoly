import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Truncates a wallet address to show first 4 and last 4 characters
 * @param address - The wallet address to truncate
 * @param startChars - Number of characters to show at start (default: 4)
 * @param endChars - Number of characters to show at end (default: 4)
 * @returns Truncated address string
 */
export function truncateAddress(
  address: string,
  startChars: number = 4,
  endChars: number = 4
): string {
  if (!address) return "";
  if (address.length <= startChars + endChars) return address;
  
  return `${address.slice(0, startChars)}...${address.slice(-endChars)}`;
}

/**
 * Generates a random player icon/avatar based on wallet address
 * @param address - The wallet address to generate icon for
 * @returns Icon emoji or character
 */
export function generatePlayerIcon(address: string): string {
  const icons = [
    "🎩", "🎯", "🎲", "🎪", "🎨", "🎭", "🎸", "🎺",
    "🚗", "🚕", "🚙", "🚌", "🚎", "🏎️", "🚓", "🚑",
    "⭐", "🌟", "✨", "💎", "💰", "🏆", "🎖️", "🏅",
    "🦄", "🐉", "🦅", "🦋", "🐺", "🦊", "🐯", "🦁"
  ];
  
  if (!address) return icons[0];
  
  // Use address to generate consistent but random-looking icon
  const hash = address.split('').reduce((acc, char) => {
    return acc + char.charCodeAt(0);
  }, 0);
  
  return icons[hash % icons.length];
}

export const formatAddress = (addr: string) => `${addr.slice(0, 6)}...${addr.slice(-4)}`;