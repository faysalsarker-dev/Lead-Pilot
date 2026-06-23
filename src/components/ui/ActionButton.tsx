"use client";

import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface ActionButtonProps {
  isLoading: boolean;
  text: string;
  loadingText?: string;
  className?: string;
  type?: "button" | "submit" | "reset";
}

export function ActionButton({
  isLoading,
  text,
  loadingText = "Processing...",
  className,
  type = "button",
}: ActionButtonProps) {
  return (
    <Button
      type={type}
      disabled={isLoading}
      className={cn(
        "h-11 w-full rounded-lg font-semibold shadow-lg shadow-slate-950/10",
        className
      )}
    >
      {isLoading ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          {loadingText}
        </>
      ) : (
        text
      )}
    </Button>
  );
}