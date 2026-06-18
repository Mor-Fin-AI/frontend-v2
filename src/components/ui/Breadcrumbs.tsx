"use client";

import { resolveRouteMeta } from "@/lib/routes";
import { useUser } from "@/context/UserContext";
import { useLocation } from "react-router-dom";
import PageHeading from "@/components/ui/PageHeading";

export default function Breadcrumbs() {
  const pathname = useLocation().pathname;
  const { user } = useUser();
  const meta = resolveRouteMeta(pathname);

  if (!meta) return null;

  const breadcrumb = meta.breadcrumb.replace("{name}", user.name);
  const subtitle = meta.subtitle?.replace("{name}", user.name);

  return <PageHeading title={breadcrumb} subtitle={subtitle} />;
}
