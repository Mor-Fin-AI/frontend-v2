import { Outlet } from "react-router-dom";
import Breadcrumbs from "@/components/ui/Breadcrumbs";
import WalletUserSync from "@/components/wallet/WalletUserSync";
import { SidebarProvider } from "@/context/SidebarContext";
import { UserProvider } from "@/context/UserContext";
import TopNavigationBar from "@/layout/TopNavigatoionBar";
import ClientNavigationBar from "@/layout/ClientNavigationBar";
import SupportChat from "@/components/support/SupportChat";

export default function ClientLayout() {
  return (
    <UserProvider>
      <WalletUserSync />
      <SidebarProvider>
        <div className="flex h-screen overflow-hidden bg-background text-foreground">
          <ClientNavigationBar />

          <div className="relative flex flex-1 flex-col overflow-hidden">
            <TopNavigationBar />

            <main className="custom-scrollbar flex-1 overflow-x-hidden overflow-y-auto p-3 md:p-5">
              <Breadcrumbs />
              <Outlet />
            </main>

            <SupportChat />
          </div>
        </div>
      </SidebarProvider>
    </UserProvider>
  );
}
