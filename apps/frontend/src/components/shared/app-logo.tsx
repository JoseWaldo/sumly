import { cn } from "@/lib/utils";

interface AppLogoProps {
  className?: string;
  iconClassName?: string;
  showText?: boolean;
}

export function AppLogo({ className, iconClassName, showText = true }: AppLogoProps) {
  return (
    <div className={cn("flex items-center gap-2.5", className)}>
      <div
        className={cn(
          "flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary",
          iconClassName,
        )}
      >
        <span className="text-[17px] font-bold leading-none text-primary-foreground">
          $
        </span>
      </div>
      {showText && (
        <span className="text-lg font-bold tracking-tight">Sumly</span>
      )}
    </div>
  );
}
