"use client";

import { useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import Breadcrumbs from "@/components/ui/Breadcrumbs";
import PageOutlet from "@/components/routing/PageOutlet";
import WalletUserSync from "@/components/wallet/WalletUserSync";
import AuthUserSync from "@/components/auth/AuthUserSync";
import { L2ChainProvider } from "@/context/L2ChainContext";
import { SidebarProvider } from "@/context/SidebarContext";
import { UserProvider } from "@/context/UserContext";
import TopNavigationBar from "@/layout/TopNavigatoionBar";
import VerticalNavigationBar from "@/layout/VerticalNavigationBar";
import SupportChat from "@/components/support/SupportChat";
import { SupportChatProvider } from "@/context/SupportChatContext";
import DashboardStickyBanner from "@/components/ui/DashboardStickyBanner";
import { MorContractsProvider } from "@/context/MorContractsContext";
import ModuleContractsBar from "@/components/contracts/ModuleContractsBar";

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
            <MorContractsProvider>
            <div className="flex h-screen flex-col overflow-hidden bg-background">
              <DashboardStickyBanner scrollContainerRef={mainRef} />

              <div className="flex min-h-0 flex-1 overflow-hidden">
                <VerticalNavigationBar />

                <div className="relative flex min-h-0 flex-1 flex-col overflow-hidden">
                  <TopNavigationBar />

                  <main
                    ref={mainRef}
                    className="custom-scrollbar flex-1 overflow-x-hidden overflow-y-auto p-3 md:p-5"
                  >
                  <Breadcrumbs />
                  <ModuleContractsBar />
                  <PageOutlet />
                  </main>

                  <SupportChat />
                </div>
              </div>
            </div>
            </MorContractsProvider>
          </SidebarProvider>
        </SupportChatProvider>
      </L2ChainProvider>
    </UserProvider>
  );
}
