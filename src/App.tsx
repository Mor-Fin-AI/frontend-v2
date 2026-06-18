import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import Web3Provider from "@/providers/Web3Provider";
import AppFluentProvider from "@/providers/FluentProvider";
import DashboardLayout from "@/layouts/DashboardLayout";
import OverviewPage from "@/app/(dashboard)/overview/page";
import ArbitrageMonitorPage from "@/app/(dashboard)/arbitrage-monitor/page";
import DaoEducationRewardsPage from "@/app/(dashboard)/dao-education-rewards/page";
import LendingDebtDischargePage from "@/app/(dashboard)/lending-debt-discharge/page";
import InfrastructureDeploymentPage from "@/app/(dashboard)/infrastructure-deployment/page";
import FeeIntegrationPage from "@/app/(dashboard)/fee-integration/page";
import SettingsPage from "@/app/(dashboard)/settings/page";
import SignInPage from "@/app/auth/sign-in/page";
import RegisterPage from "@/app/auth/register/page";
import { ThemeProvider } from "@/context/ThemeContext";

export default function App() {
  return (
    <ThemeProvider>
      <Web3Provider>
        <AppFluentProvider>
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Navigate to="/overview" replace />} />

              <Route path="/sign-in" element={<SignInPage />} />
              <Route path="/register" element={<RegisterPage />} />

              <Route element={<DashboardLayout />}>
                <Route path="/overview" element={<OverviewPage />} />
                <Route path="/arbitrage-monitor" element={<ArbitrageMonitorPage />} />
                <Route
                  path="/dao-education-rewards"
                  element={<DaoEducationRewardsPage />}
                />
                <Route
                  path="/lending-debt-discharge"
                  element={<LendingDebtDischargePage />}
                />
                <Route
                  path="/infrastructure-deployment"
                  element={<InfrastructureDeploymentPage />}
                />
                <Route path="/fee-integration" element={<FeeIntegrationPage />} />
                <Route path="/settings" element={<SettingsPage />} />
              </Route>

              <Route path="*" element={<Navigate to="/overview" replace />} />
            </Routes>
          </BrowserRouter>
        </AppFluentProvider>
      </Web3Provider>
    </ThemeProvider>
  );
}
