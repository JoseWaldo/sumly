import * as React from "react";
import { format } from "date-fns";
import { TZDate } from "@date-fns/tz";
import { CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { COLOMBIA_TZ, parseDateCol, formatDateCol } from "@/lib/date-utils";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";

interface DateInputProps {
  value?: string;
  onChange?: (value: string) => void;
  className?: string;
}

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

    const selectedDate = value ? parseDateCol(value) : null;

    const [viewDate, setViewDate] = React.useState(() =>
      selectedDate ?? TZDate.tz(COLOMBIA_TZ)
    );

    React.useEffect(() => {
      if (selectedDate && !popoverOpen) {
        setViewDate(selectedDate);
      }
    }, [value, popoverOpen]);

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

    const selectDay = (day: Date) => {
      onChange?.(format(day, "yyyy-MM-dd"));
      setPopoverOpen(false);
      setTypedValue("");
    };

    const displayValue = isTyping
      ? typedValue
      : selectedDate
        ? formatDateCol(selectedDate, "dd MMM yyyy")
        : "";

    return (
      <div ref={ref} className={cn("relative", className)}>
        <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
          <PopoverTrigger>
            <div className="relative">
              <CalendarIcon className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground pointer-events-none" />
              <input
                type="text"
                className="flex h-9 w-full rounded-md border border-input/50 bg-transparent pl-8 pr-3 py-1 text-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                placeholder="dd/mm/aaaa"
                value={displayValue}
                onChange={handleTypedChange}
                onBlur={handleTypedBlur}
                onFocus={() => setPopoverOpen(true)}
              />
            </div>
          </PopoverTrigger>
          <PopoverContent width={260}>
            <Calendar
              month={viewDate}
              onMonthChange={setViewDate}
              selected={selectedDate ?? undefined}
              onSelect={selectDay}
              today={TZDate.tz(COLOMBIA_TZ)}
            />
          </PopoverContent>
        </Popover>
      </div>
    );
  }
);
DateInput.displayName = "DateInput";

export { DateInput };
