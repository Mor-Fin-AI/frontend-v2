"use client";

import { Title3 } from "@fluentui/react-components";
import clsx from "clsx";

interface SectionHeadingProps {
  children: React.ReactNode;
  className?: string;
}

export default function SectionHeading({
  children,
  className,
}: SectionHeadingProps) {
  return (
    <Title3 block className={clsx("!text-foreground !font-medium", className)}>
      {children}
    </Title3>
  );
}
