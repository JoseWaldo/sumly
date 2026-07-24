import { useEffect, type ReactNode } from "react";
import { useAtomValue } from "jotai";

import { themeAtom } from "@/stores/theme.atom";

export function ThemeProvider({ children }: { children: ReactNode }) {
  const theme = useAtomValue(themeAtom);

  useEffect(() => {
    const root = document.documentElement;
    if (theme === "dark") {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
  }, [theme]);

  return <>{children}</>;
}
