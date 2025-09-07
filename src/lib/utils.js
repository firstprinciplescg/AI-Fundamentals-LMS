import { clsx } from "clsx";
import { twMerge } from "tailwind-merge"

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}


export const getFileContent = async (filePath) => {
  const response = await fetch(filePath);
  const text = await response.text();
  return text;
};

