"use client";

import {
  FluentProvider,
  SSRProvider,
} from "@fluentui/react-components";
import { ReactNode, useEffect } from "react";
import { useTheme } from "@/context/ThemeContext";
import { fluentThemes } from "@/lib/fluentTheme";
import { applyFluentThemeCssVariables } from "@/lib/syncFluentCssVars";
import { AppToaster } from "@/components/ui/AppToaster";

export default function AppFluentProvider({ children }: { children: ReactNode }) {
  const { theme } = useTheme();
  const fluentTheme = fluentThemes[theme];

  useEffect(() => {
    applyFluentThemeCssVariables(fluentTheme, theme);
  }, [fluentTheme, theme]);

  return (
    <SSRProvider>
      <FluentProvider theme={fluentTheme}>
        {children}
        <AppToaster />
      </FluentProvider>
    </SSRProvider>
  );
}
