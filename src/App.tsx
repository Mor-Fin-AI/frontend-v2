import { RouterProvider } from "react-router-dom";

import Web3Provider from "@/providers/Web3Provider";
import AppFluentProvider from "@/providers/FluentProvider";
import { ThemeProvider } from "@/context/ThemeContext";
import { AuthProvider } from "@/context/AuthContext";
import { router } from "@/router";

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Web3Provider>
          <AppFluentProvider>
            <RouterProvider router={router} />
          </AppFluentProvider>
        </Web3Provider>
      </AuthProvider>
    </ThemeProvider>
  );
}
