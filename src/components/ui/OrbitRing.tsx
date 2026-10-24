import { cn } from "@/lib/utils";

/**
 * Anel orbital decorativo com um pequeno planeta que gira devagar.
 * Só CSS; o movimento é desligado com "reduzir movimento" no sistema.
 */
export function OrbitRing({
  className,
  planetClassName,
  duration = "30s",
  reverse = false,
}: {
  className?: string;
  planetClassName?: string;
  duration?: string;
  reverse?: boolean;
}) {
  return (
    <span
      aria-hidden="true"
      className={cn("pointer-events-none absolute rounded-full border border-dashed", className)}
    >
      <span
        className="animate-orbit absolute inset-0"
        style={{ animationDuration: duration, animationDirection: reverse ? "reverse" : "normal" }}
      >
        <span
          className={cn(
            "absolute left-1/2 top-0 h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full",
            planetClassName,
          )}
        />
      </span>
    </span>
  );
}
