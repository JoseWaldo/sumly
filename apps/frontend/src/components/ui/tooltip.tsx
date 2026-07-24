import * as React from "react";
import { cn } from "@/lib/utils";

interface TooltipProps {
  content: string;
  children: React.ReactNode;
}

export function Tooltip({ content, children }: TooltipProps) {
  const [visible, setVisible] = React.useState(false);
  const timeoutRef = React.useRef<ReturnType<typeof setTimeout>>(undefined);

  const show = () => {
    timeoutRef.current = setTimeout(() => setVisible(true), 200);
  };

  const hide = () => {
    clearTimeout(timeoutRef.current);
    setVisible(false);
  };

  React.useEffect(() => {
    return () => clearTimeout(timeoutRef.current);
  }, []);

  return (
    <div
      className="relative"
      onMouseEnter={show}
      onMouseLeave={hide}
      onFocus={show}
      onBlur={hide}
    >
      {children}
      <div
        role="tooltip"
        className={cn(
          "pointer-events-none absolute left-full top-1/2 z-50 ml-2 -translate-y-1/2 transition-all duration-200",
          visible
            ? "opacity-100 translate-x-0"
            : "opacity-0 -translate-x-1",
        )}
      >
        <div
          className={cn(
            "whitespace-nowrap rounded-md border border-border/50 bg-foreground px-2.5 py-1.5 text-xs text-background shadow-sm",
          )}
        >
          {content}
        </div>
      </div>
    </div>
  );
}
