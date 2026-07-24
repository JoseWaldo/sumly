import * as React from "react";
import { cn } from "@/lib/utils";
import { formatCurrencyInput, parseCurrencyInput } from "@/lib/date-utils";

interface CurrencyInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "value" | "onChange" | "type"> {
  value?: number | null;
  onChange?: (value: number) => void;
}

const CurrencyInput = React.forwardRef<HTMLInputElement, CurrencyInputProps>(
  ({ className, value, onChange, onBlur, ...props }, ref) => {
    const [displayValue, setDisplayValue] = React.useState(() =>
      formatCurrencyInput(value)
    );
    const [isFocused, setIsFocused] = React.useState(false);

    React.useEffect(() => {
      if (!isFocused && value !== undefined && value !== null) {
        setDisplayValue(formatCurrencyInput(value));
      }
    }, [value, isFocused]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const raw = e.target.value;
      const digitsOnly = raw.replace(/[^\d]/g, "");
      setDisplayValue(Number(digitsOnly).toLocaleString("es-CO"));
      onChange?.(parseCurrencyInput(raw));
    };

    const handleFocus = () => {
      setIsFocused(true);
      if (value && value > 0) {
        setDisplayValue(value.toString().replace(".", ","));
      }
    };

    const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
      setIsFocused(false);
      setDisplayValue(formatCurrencyInput(value));
      onBlur?.(e);
    };

    return (
      <div className="relative">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground pointer-events-none">
          $
        </span>
        <input
          ref={ref}
          type="text"
          inputMode="decimal"
          className={cn(
            "flex h-9 w-full rounded-md border border-input/50 bg-transparent pl-7 pr-3 py-1 text-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50",
            className
          )}
          value={displayValue}
          onChange={handleChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          placeholder="0"
          {...props}
        />
      </div>
    );
  }
);
CurrencyInput.displayName = "CurrencyInput";

export { CurrencyInput };
