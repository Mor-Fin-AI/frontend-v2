"use client";

import { routeMeta } from "@/lib/routes";
import Link from "next/link";
import { usePathname } from "next/navigation";


export default function Breadcrumbs() {
  const pathname = usePathname();
  const meta = routeMeta[pathname];

  if (!meta) return null;

  return (
    <div className="mb-5">
      <h1 className="font-inter font-bold text-2xl text-white">
        {meta.breadcrumb}
      </h1>
      {meta.subtitle && (
        <p className="font-inter font-medium text-sm text-primary mt-1">
          {meta.subtitle}
        </p>
      )}
    </div>
  );
}
