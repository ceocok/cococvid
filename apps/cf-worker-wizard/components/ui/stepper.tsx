import * as React from "react";
import { cn } from "@/lib/utils";

export type Step = {
  id: number | string;
  label: string;
};

export function Stepper({ steps, active }: { steps: Step[]; active: Step["id"] }) {
  const currentIndex = steps.findIndex((s) => s.id === active);
  return (
    <ol className="flex items-center gap-2 text-sm">
      {steps.map((s, i) => {
        const state = i === currentIndex ? "current" : i < currentIndex ? "done" : "todo";
        return (
          <li
            key={String(s.id)}
            className={cn(
              "flex items-center gap-2",
              state === "current"
                ? "font-semibold"
                : state === "done"
                ? "text-green-600"
                : "text-muted-foreground"
            )}
          >
            <span
              className={cn(
                "inline-flex h-6 w-6 items-center justify-center rounded-full border",
                state === "done"
                  ? "bg-green-600 text-white border-green-600"
                  : state === "current"
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-foreground/60"
              )}
            >
              {i + 1}
            </span>
            <span>{s.label}</span>
            {i !== steps.length - 1 && (
              <span className="mx-2 text-muted-foreground">/</span>
            )}
          </li>
        );
      })}
    </ol>
  );
}
