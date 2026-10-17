import { cn } from "cn";
import * as React from "react";

function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        "flex field-sizing-content min-h-28 w-full rounded-lg border border-input bg-surface px-3 py-2 text-base transition-colors placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-2 aria-invalid:border-danger",
        className,
      )}
      {...props}
    />
  );
}

export { Textarea };
