"use client";

import { Avatar } from "@fluentui/react-components";
import clsx from "clsx";
import WalletBlockie from "@/components/wallet/WalletBlockie";

type ProfileAvatarProps = {
  address?: string | null;
  name: string;
  size: 24 | 28 | 32 | 36 | 40 | 48 | 56 | 64 | 72 | 96 | 120 | 128;
  className?: string;
};

export default function ProfileAvatar({
  address,
  name,
  size,
  className,
}: ProfileAvatarProps) {
  if (address) {
    return (
      <span
        className={clsx(
          "inline-flex shrink-0 items-center justify-center rounded-full border border-border bg-background p-0.5 shadow-sm",
          className
        )}
      >
        <WalletBlockie address={address} size={size - 4} alt={`${name} wallet avatar`} />
      </span>
    );
  }

  return (
    <Avatar
      className={className}
      name={name}
      size={size}
      color="neutral"
      active="active"
      activeAppearance="ring"
    />
  );
}
