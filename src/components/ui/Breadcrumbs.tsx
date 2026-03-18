"use client";

import { routeMeta } from "@/lib/routes";
import { useUser } from "@/context/UserContext";
import Link from "next/link";
import { usePathname } from "next/navigation";


export default function Breadcrumbs() {
  const pathname = usePathname();
  const { user } = useUser();
  const meta = routeMeta[pathname];

  if (!meta) return null;

  const breadcrumb = meta.breadcrumb.replace("{name}", user.name);
  const subtitle = meta.subtitle?.replace("{name}", user.name);

  return (
    <div className="mb-5">
      <h1 className="font-inter font-bold text-2xl text-white">
        {breadcrumb}
      </h1>
      {subtitle && (
        <p className="font-inter font-medium text-sm text-primary mt-1">
          {subtitle}
        </p>
      )}
    </div>
  );
}
