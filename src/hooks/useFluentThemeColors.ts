import { useTheme } from "@/context/ThemeContext";
import { fluentThemes } from "@/lib/fluentTheme";

export function useFluentThemeColors() {
  const { theme } = useTheme();
  return fluentThemes[theme];
}
