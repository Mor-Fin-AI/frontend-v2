"use client";

import { useMemo } from "react";
import makeBlockie from "ethereum-blockies-base64";
import clsx from "clsx";

type WalletBlockieProps = {
  address: string;
  size?: number;
  className?: string;
  alt?: string;
};

export default function WalletBlockie({
  address,
  size = 36,
  className,
  alt,
}: WalletBlockieProps) {
  const src = useMemo(() => makeBlockie(address), [address]);

  return (
    <img
      src={src}
      alt={alt ?? `Wallet identicon for ${address}`}
      width={size}
      height={size}
      className={clsx("block shrink-0 rounded-full", className)}
      style={{ width: size, height: size }}
    />
  );
}
