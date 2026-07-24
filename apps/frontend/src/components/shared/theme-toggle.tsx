import { useAtom } from "jotai";
import { Moon, Sun } from "lucide-react";

import { Button } from "@/components/ui/button";
import { themeAtom } from "@/stores/theme.atom";

export function ThemeToggle() {
  const [theme, setTheme] = useAtom(themeAtom);

  const toggle = () => setTheme(theme === "dark" ? "light" : "dark");

  return (
    <Button variant="ghost" size="icon" onClick={toggle}>
      <Sun className="h-[1.15rem] w-[1.15rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
      <Moon className="absolute h-[1.15rem] w-[1.15rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
      <span className="sr-only">Cambiar tema</span>
    </Button>
  );
}
