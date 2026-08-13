import * as React from "react";
import { createPortal } from "react-dom";
import { cn } from "@/lib/utils";

interface PopoverContextValue {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  triggerRef: React.RefObject<HTMLElement | null>;
}

const PopoverContext = React.createContext<PopoverContextValue | null>(null);

function usePopoverContext(component: string) {
  const context = React.useContext(PopoverContext);
  if (!context) {
    throw new Error(`<${component} /> debe usarse dentro de <Popover />`);
  }
  return context;
}

interface PopoverProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: React.ReactNode;
}

function Popover({ open, onOpenChange, children }: PopoverProps) {
  const triggerRef = React.useRef<HTMLElement | null>(null);
  const value = React.useMemo(() => ({ open, onOpenChange, triggerRef }), [open, onOpenChange]);

  return <PopoverContext.Provider value={value}>{children}</PopoverContext.Provider>;
}

interface PopoverTriggerProps {
  children: React.ReactElement;
}

function PopoverTrigger({ children }: PopoverTriggerProps) {
  const { triggerRef } = usePopoverContext("PopoverTrigger");
  return React.cloneElement(children, { ref: triggerRef } as React.RefAttributes<HTMLElement>);
}

function computePosition(
  triggerEl: HTMLElement,
  width: number,
  sideOffset: number
): React.CSSProperties {
  const rect = triggerEl.getBoundingClientRect();
  const estimatedHeight = 300;
  const spaceBelow = window.innerHeight - rect.bottom - sideOffset;
  const spaceAbove = rect.top - sideOffset;
  const upwards = spaceBelow < estimatedHeight && spaceAbove > spaceBelow;

  const popoverWidth = Math.min(width, window.innerWidth - 16);
  let left = rect.left;
  if (left + popoverWidth > window.innerWidth - 8) {
    left = window.innerWidth - popoverWidth - 8;
  }
  if (left < 8) left = 8;

  return {
    position: "fixed",
    top: upwards ? rect.top - sideOffset : rect.bottom + sideOffset,
    left,
    zIndex: 60,
    width: popoverWidth,
    visibility: "visible",
    transform: upwards ? "translateY(-100%)" : undefined,
  };
}

interface PopoverContentProps {
  className?: string;
  width?: number;
  sideOffset?: number;
  children: React.ReactNode;
}

function PopoverContent({ className, width = 256, sideOffset = 4, children }: PopoverContentProps) {
  const { open, onOpenChange, triggerRef } = usePopoverContext("PopoverContent");
  const contentRef = React.useRef<HTMLDivElement>(null);
  const [style, setStyle] = React.useState<React.CSSProperties>({
    position: "fixed",
    visibility: "hidden",
  });

  const updatePosition = React.useCallback(() => {
    if (!triggerRef.current) return;
    setStyle(computePosition(triggerRef.current, width, sideOffset));
  }, [triggerRef, width, sideOffset]);

  React.useLayoutEffect(() => {
    if (!open) return;
    updatePosition();
    window.addEventListener("scroll", updatePosition, true);
    window.addEventListener("resize", updatePosition);
    return () => {
      window.removeEventListener("scroll", updatePosition, true);
      window.removeEventListener("resize", updatePosition);
    };
  }, [open, updatePosition]);

  React.useEffect(() => {
    if (!open) return;

    function handlePointerDown(e: MouseEvent) {
      const target = e.target as Node;
      if (triggerRef.current?.contains(target) || contentRef.current?.contains(target)) return;
      onOpenChange(false);
    }

    // capture + stopPropagation: algunos modales padre (report-payment-dialog,
    // subscription-dialog) tienen su propio listener de Escape en document que
    // cierra el modal entero — sin esto, Escape cerraría el popover y el modal
    // de una sola vez.
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        e.stopPropagation();
        onOpenChange(false);
      }
    }

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown, true);
    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown, true);
    };
  }, [open, onOpenChange, triggerRef]);

  if (!open) return null;

  return createPortal(
    <div
      ref={contentRef}
      style={style}
      className={cn(
        "rounded-lg border border-border/30 bg-popover text-popover-foreground p-3 shadow-lg animate-scale-in",
        className
      )}
    >
      {children}
    </div>,
    document.body
  );
}

export { Popover, PopoverTrigger, PopoverContent };
