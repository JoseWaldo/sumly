import { useEffect, useRef, useState, useCallback } from "react";
import { X, SlidersHorizontal } from "lucide-react";
import { createPortal } from "react-dom";
import { cn } from "@/lib/utils";

interface FilterSheetProps {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

export function FilterSheet({ open, onClose, children }: FilterSheetProps) {
  const [visible, setVisible] = useState(false);
  const [animating, setAnimating] = useState(false);
  const sheetRef = useRef<HTMLDivElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);
  const exitingRef = useRef(false);

  const finishExit = useCallback(() => {
    setVisible(false);
    previousFocusRef.current?.focus();
    exitingRef.current = false;
  }, []);

  const handleTransitionEnd = useCallback(
    (e: React.TransitionEvent) => {
      if (e.target === sheetRef.current && e.propertyName === "transform" && exitingRef.current) {
        finishExit();
      }
    },
    [finishExit]
  );

  useEffect(() => {
    if (open) {
      exitingRef.current = false;
      previousFocusRef.current = document.activeElement as HTMLElement;
      setVisible(true);
      requestAnimationFrame(() => {
        requestAnimationFrame(() => setAnimating(true));
      });
      return;
    }

    exitingRef.current = true;
    setAnimating(false);
    const fallback = setTimeout(() => {
      if (exitingRef.current) finishExit();
    }, 400);
    return () => clearTimeout(fallback);
  }, [open, finishExit]);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
        return;
      }

      if (e.key === "Tab" && sheetRef.current) {
        const focusable = sheetRef.current.querySelectorAll<HTMLElement>(
          'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])'
        );
        const first = focusable[0];
        const last = focusable[focusable.length - 1];

        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last?.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first?.focus();
        }
      }
    },
    [onClose]
  );

  useEffect(() => {
    if (visible) {
      document.addEventListener("keydown", handleKeyDown);
      return () => document.removeEventListener("keydown", handleKeyDown);
    }
  }, [visible, handleKeyDown]);

  if (!visible) return null;

  return createPortal(
    <div className="fixed inset-0 z-50 isolate">
      <div
        onClick={onClose}
        className={cn(
          "absolute inset-0 bg-black/40",
          animating ? "opacity-100" : "opacity-0"
        )}
        style={{ transition: "opacity 200ms ease-out" }}
      />

      <div
        ref={sheetRef}
        role="dialog"
        aria-modal="true"
        aria-label="Filtros"
        onTransitionEnd={handleTransitionEnd}
        className={cn(
          "absolute right-0 top-0 h-full w-[340px] max-w-[100vw] sm:w-[380px]",
          "flex flex-col bg-card border-l border-border/30",
          "shadow-xl shadow-black/10",
          animating ? "translate-x-0" : "translate-x-full"
        )}
        style={{
          transition: "transform 300ms cubic-bezier(0.16, 1, 0.3, 1)",
        }}
      >
        {children}
      </div>
    </div>,
    document.body
  );
}

FilterSheet.Header = function FilterSheetHeader({
  onClose,
}: {
  onClose: () => void;
}) {
  return (
    <div className="flex items-center justify-between border-b border-border/30 px-5 py-3.5 shrink-0">
      <div className="flex items-center gap-2.5">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
          <SlidersHorizontal className="h-4 w-4 text-primary" />
        </div>
        <h2 className="text-base font-medium">Filtros</h2>
      </div>
      <button
        type="button"
        onClick={onClose}
        className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground hover:bg-accent hover:text-foreground transition-colors cursor-pointer"
        aria-label="Cerrar filtros"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
};

FilterSheet.Body = function FilterSheetBody({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex-1 overflow-y-auto px-5 py-4 space-y-5 scrollbar-thin">
      {children}
    </div>
  );
};

FilterSheet.Section = function FilterSheetSection({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <fieldset className="space-y-2.5">
      <legend className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
        {label}
      </legend>
      {children}
    </fieldset>
  );
};

FilterSheet.Footer = function FilterSheetFooter({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="shrink-0 border-t border-border/30 px-5 py-3.5 flex items-center gap-3">
      {children}
    </div>
  );
};
