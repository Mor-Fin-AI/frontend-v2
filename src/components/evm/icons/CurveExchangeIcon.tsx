import type { SVGProps } from "react";

type CurveExchangeIconProps = SVGProps<SVGSVGElement> & {
  size?: number | string;
};

/** Curve Finance logo — not available in @web3icons/react exchanges set. */
export default function CurveExchangeIcon({
  size = 24,
  className,
  ...props
}: CurveExchangeIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden
      {...props}
    >
      <circle cx="8.5" cy="14.5" r="3.5" fill="#FF0069" />
      <circle cx="15.5" cy="14.5" r="3.5" fill="#FF0069" />
      <circle cx="12" cy="8" r="3.5" fill="#FF0069" />
    </svg>
  );
}
