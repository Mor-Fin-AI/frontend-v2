import PanelCard, { PanelCardHeader } from "@/components/ui/PanelCard";

export default function ClientOverviewPage() {
  return (
    <PanelCard className="text-center">
      <PanelCardHeader
        title="Client Overview"
        description="Manage your organization's DSA account and treasury from the Client Portal."
        headingAs="h4"
      />
    </PanelCard>
  );
}
