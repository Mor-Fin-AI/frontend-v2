"use client";

import { Subtitle2, Title2 } from "@fluentui/react-components";

interface PageHeadingProps {
  title: string;
  subtitle?: string;
}

export default function PageHeading({ title, subtitle }: PageHeadingProps) {
  return (
    <div className="mb-5">
      <Title2 block className="!text-foreground !font-semibold">
        {title}
      </Title2>
      {subtitle && (
        <Subtitle2 block className="!text-muted-foreground mt-1">
          {subtitle}
        </Subtitle2>
      )}
    </div>
  );
}
