"use client";

import { useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import Breadcrumbs from "@/components/ui/Breadcrumbs";
import RouteOutlet from "@/components/routing/RouteOutlet";
import WalletUserSync from "@/components/wallet/WalletUserSync";
import AuthUserSync from "@/components/auth/AuthUserSync";
import { L2ChainProvider } from "@/context/L2ChainContext";
import { SidebarProvider } from "@/context/SidebarContext";
import { UserProvider } from "@/context/UserContext";
import TopNavigationBar from "@/layout/TopNavigatoionBar";
import VerticalNavigationBar from "@/layout/VerticalNavigationBar";
import SupportChat from "@/components/support/SupportChat";
import { SupportChatProvider } from "@/context/SupportChatContext";

export default function DashboardLayout() {
  const mainRef = useRef<HTMLElement>(null);
  const { pathname } = useLocation();

  useEffect(() => {
    mainRef.current?.scrollTo({ top: 0, behavior: "auto" });
  }, [pathname]);

  return (
    <UserProvider>
      <L2ChainProvider>
        <WalletUserSync />
        <AuthUserSync />
        <SupportChatProvider>
          <SidebarProvider>
            <div className="flex h-screen overflow-hidden bg-background">
              <VerticalNavigationBar />

              <div className="relative flex flex-1 flex-col overflow-hidden">
                <TopNavigationBar />

                <main
                  ref={mainRef}
                  className="custom-scrollbar flex-1 overflow-x-hidden overflow-y-auto p-3 md:p-5"
                >
                  <Breadcrumbs />
                  <RouteOutlet />
                </main>

                <SupportChat />
              </div>
            </div>
          </SidebarProvider>
        </SupportChatProvider>
      </L2ChainProvider>
    </UserProvider>
  );
}
