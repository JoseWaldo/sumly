import { DayPicker, type DayButtonProps } from "react-day-picker";
import { es } from "date-fns/locale";
import { TZDate } from "@date-fns/tz";
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { COLOMBIA_TZ } from "@/lib/date-utils";

const MONTH_NAMES = [
  "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
  "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre",
];

function CalendarDayButton({ className, modifiers, ...props }: DayButtonProps) {
  return (
    <button
      type="button"
      className={cn(
        "flex h-7 w-7 items-center justify-center rounded-md text-xs transition-colors cursor-pointer",
        modifiers.outside && "text-muted-foreground",
        modifiers.selected
          ? "bg-primary text-primary-foreground"
          : modifiers.today
            ? "bg-accent text-accent-foreground font-medium"
            : "hover:bg-accent text-foreground",
        className
      )}
      {...props}
    />
  );
}

interface CalendarProps {
  month: Date;
  onMonthChange: (date: Date) => void;
  selected?: Date;
  onSelect: (date: Date) => void;
  today: Date;
  className?: string;
}

function Calendar({ month, onMonthChange, selected, onSelect, today, className }: CalendarProps) {
  const goMonth = (delta: number) => {
    const d = new TZDate(month, COLOMBIA_TZ);
    d.setMonth(month.getMonth() + delta);
    onMonthChange(d);
  };

  const goYear = (delta: number) => {
    const d = new TZDate(month, COLOMBIA_TZ);
    d.setFullYear(month.getFullYear() + delta);
    onMonthChange(d);
  };

  return (
    <div className={cn("select-none", className)}>
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
          {MONTH_NAMES[month.getMonth()]} {month.getFullYear()}
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

      <DayPicker
        mode="single"
        month={month}
        onMonthChange={onMonthChange}
        selected={selected}
        onSelect={(d) => d && onSelect(d)}
        today={today}
        locale={es}
        showOutsideDays
        hideNavigation
        classNames={{
          months: "",
          month: "",
          month_grid: "w-full border-collapse",
          weekdays: "flex mb-1",
          weekday: "flex h-7 w-7 items-center justify-center text-xs font-normal text-muted-foreground",
          weeks: "",
          week: "flex w-full mt-0.5",
          day: "flex h-7 w-7 items-center justify-center p-0 text-center",
        }}
        components={{
          MonthCaption: () => <></>,
          DayButton: CalendarDayButton,
        }}
      />
    </div>
  );
}

export { Calendar };
