// import VerticalNavigationBar from "@/layout/VerticalNavigationBar";
// import TopNavigationBar from "@/layout/TopNavigationBar";
import Breadcrumbs from "@/components/ui/Breadcrumbs";
import { SidebarProvider } from "@/context/SidebarContext";
import TopNavigationBar from "@/layout/TopNavigatoionBar";
import VerticalNavigationBar from "@/layout/VerticalNavigationBar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SidebarProvider>
      <div className="flex h-screen overflow-hidden bg-background ">
        <VerticalNavigationBar />

        <div className="flex-1 flex flex-col overflow-hidden">
          <TopNavigationBar />

          <main className="flex-1 p-3 md:p-5 overflow-y-auto custom-scrollbar ">
            <Breadcrumbs />
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
