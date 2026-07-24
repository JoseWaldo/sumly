import * as React from "react";
import { format, getDaysInMonth, getDay, startOfMonth } from "date-fns";
import { TZDate } from "@date-fns/tz";
import { Calendar, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { COLOMBIA_TZ, parseDateCol, todayCol, formatDateCol } from "@/lib/date-utils";

interface DateInputProps {
  value?: string;
  onChange?: (value: string) => void;
  className?: string;
}

const DAY_NAMES = ["Do", "Lu", "Ma", "Mi", "Ju", "Vi", "Sa"];
const MONTH_NAMES = [
  "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
  "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre",
];

function parseTypedDate(input: string): string | null {
  const cleaned = input.trim().replace(/[\/\-\.]/g, "/");
  const parts = cleaned.split("/");
  if (parts.length !== 3) return null;

  const day = Number(parts[0]);
  const month = Number(parts[1]);
  const year = parts[2].length === 2 ? 2000 + Number(parts[2]) : Number(parts[2]);

  if (isNaN(day) || isNaN(month) || isNaN(year)) return null;
  if (month < 1 || month > 12) return null;
  if (day < 1 || day > 31) return null;

  return `${String(year).padStart(4, "0")}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

const DateInput = React.forwardRef<HTMLDivElement, DateInputProps>(
  ({ value, onChange, className }, ref) => {
    const [popoverOpen, setPopoverOpen] = React.useState(false);
    const [typedValue, setTypedValue] = React.useState("");
    const isTyping = typedValue !== "";
    const wrapperRef = React.useRef<HTMLDivElement>(null);
    const [popupStyle, setPopupStyle] = React.useState<React.CSSProperties>({
      position: "fixed",
      visibility: "hidden",
    });

    const selectedDate = value ? parseDateCol(value) : null;

    const [viewDate, setViewDate] = React.useState(() =>
      selectedDate ?? TZDate.tz(COLOMBIA_TZ)
    );

    React.useEffect(() => {
      if (selectedDate && !popoverOpen) {
        setViewDate(selectedDate);
      }
    }, [value, popoverOpen]);

    const computePosition = React.useCallback(() => {
      if (!wrapperRef.current) return {};

      const rect = wrapperRef.current.getBoundingClientRect();
      const estimatedHeight = 300;
      const gap = 4;
      const spaceBelow = window.innerHeight - rect.bottom - gap;
      const spaceAbove = rect.top - gap;
      const upwards = spaceBelow < estimatedHeight && spaceAbove > spaceBelow;

      const popoverWidth = Math.min(256, window.innerWidth - 16);
      let left = rect.left;
      if (left + popoverWidth > window.innerWidth - 8) {
        left = window.innerWidth - popoverWidth - 8;
      }
      if (left < 8) left = 8;

      return {
        position: "fixed" as const,
        top: upwards ? rect.top - gap : rect.bottom + gap,
        left,
        zIndex: 60,
        width: popoverWidth,
        visibility: "visible" as const,
      };
    }, []);

    React.useLayoutEffect(() => {
      if (!popoverOpen || !wrapperRef.current) return;

      const updatePosition = () => {
        setPopupStyle(computePosition());
      };

      window.addEventListener("scroll", updatePosition, true);
      window.addEventListener("resize", updatePosition);

      return () => {
        window.removeEventListener("scroll", updatePosition, true);
        window.removeEventListener("resize", updatePosition);
      };
    }, [popoverOpen, computePosition]);

    const handleOpen = React.useCallback(() => {
      if (!wrapperRef.current) return;
      setPopupStyle(computePosition());
      setPopoverOpen(true);
    }, [computePosition]);

    const handleTypedChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const raw = e.target.value;
      setTypedValue(raw);

      const parsed = parseTypedDate(raw);
      if (parsed) {
        onChange?.(parsed);
        setTypedValue("");
      }
    };

    const handleTypedBlur = () => {
      if (!selectedDate) {
        setTypedValue("");
      }
    };

    const selectDay = (day: number) => {
      const d = TZDate.tz(COLOMBIA_TZ, viewDate.getFullYear(), viewDate.getMonth(), day);
      const iso = format(d, "yyyy-MM-dd");
      onChange?.(iso);
      setPopoverOpen(false);
      setTypedValue("");
    };

    const goMonth = (delta: number) => {
      const d = new TZDate(viewDate, COLOMBIA_TZ);
      d.setMonth(viewDate.getMonth() + delta);
      setViewDate(d);
    };

    const goYear = (delta: number) => {
      const d = new TZDate(viewDate, COLOMBIA_TZ);
      d.setFullYear(viewDate.getFullYear() + delta);
      setViewDate(d);
    };

    const daysInMonth = getDaysInMonth(viewDate);
    const firstDayOfWeek = getDay(startOfMonth(viewDate));

    const displayValue = isTyping
      ? typedValue
      : selectedDate
        ? formatDateCol(selectedDate, "dd MMM yyyy")
        : "";

    return (
      <div ref={ref} className={cn("relative", className)}>
        <div ref={wrapperRef} className="relative">
          <Calendar className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground pointer-events-none" />
          <input
            type="text"
            className="flex h-9 w-full rounded-md border border-input/50 bg-transparent pl-8 pr-3 py-1 text-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
            placeholder="dd/mm/aaaa"
            value={displayValue}
            onChange={handleTypedChange}
            onBlur={handleTypedBlur}
            onFocus={handleOpen}
          />
        </div>

        {popoverOpen && (
          <>
            <div className="fixed inset-0 z-[55]" onClick={() => setPopoverOpen(false)} />
            <div
              style={popupStyle}
              className="rounded-lg border border-border/30 bg-card p-3 shadow-lg"
            >
              <div className="mb-2 flex items-center justify-between">
                <div className="flex items-center gap-0.5">
                  <button
                    type="button"
                    onClick={() => goYear(-1)}
                    className="flex h-6 w-6 items-center justify-center rounded-md hover:bg-accent cursor-pointer"
                  >
                    <ChevronsLeft className="h-3.5 w-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => goMonth(-1)}
                    className="flex h-6 w-6 items-center justify-center rounded-md hover:bg-accent cursor-pointer"
                  >
                    <ChevronLeft className="h-3.5 w-3.5" />
                  </button>
                </div>
                <span className="text-sm font-medium">
                  {MONTH_NAMES[viewDate.getMonth()]} {viewDate.getFullYear()}
                </span>
                <div className="flex items-center gap-0.5">
                  <button
                    type="button"
                    onClick={() => goMonth(1)}
                    className="flex h-6 w-6 items-center justify-center rounded-md hover:bg-accent cursor-pointer"
                  >
                    <ChevronRight className="h-3.5 w-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => goYear(1)}
                    className="flex h-6 w-6 items-center justify-center rounded-md hover:bg-accent cursor-pointer"
                  >
                    <ChevronsRight className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-7 gap-0.5 mb-1">
                {DAY_NAMES.map((name) => (
                  <div key={name} className="flex h-7 items-center justify-center text-xs text-muted-foreground">
                    {name}
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-7 gap-0.5">
                {Array.from({ length: firstDayOfWeek }).map((_, i) => (
                  <div key={`empty-${i}`} />
                ))}
                {Array.from({ length: daysInMonth }, (_, i) => i + 1).map((day) => {
                  const date = TZDate.tz(COLOMBIA_TZ, viewDate.getFullYear(), viewDate.getMonth(), day);
                  const isSelected =
                    selectedDate &&
                    selectedDate.getFullYear() === date.getFullYear() &&
                    selectedDate.getMonth() === date.getMonth() &&
                    selectedDate.getDate() === date.getDate();
                  const isToday = todayCol() === format(date, "yyyy-MM-dd");

                  return (
                    <button
                      key={day}
                      type="button"
                      onClick={() => selectDay(day)}
                      className={cn(
                        "flex h-7 w-7 items-center justify-center rounded-md text-xs transition-colors cursor-pointer",
                        isSelected
                          ? "bg-primary text-primary-foreground"
                          : isToday
                            ? "bg-accent text-accent-foreground font-medium"
                            : "hover:bg-accent text-foreground"
                      )}
                    >
                      {day}
                    </button>
                  );
                })}
              </div>
            </div>
          </>
        )}
      </div>
    );
  }
);
DateInput.displayName = "DateInput";

export { DateInput };
