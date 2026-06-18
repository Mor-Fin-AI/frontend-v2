"use client";

import { useMemo } from "react";
import makeBlockie from "ethereum-blockies-base64";
import {
  Persona,
  makeStyles,
  mergeClasses,
  personaClassNames,
  presenceAvailableRegular,
  presenceOfflineRegular,
  tokens,
  type PersonaProps,
} from "@fluentui/react-components";

const AvailableIcon = presenceAvailableRegular.small;
const OfflineIcon = presenceOfflineRegular.small;

type ProfilePersonaProps = {
  name: string;
  address?: string | null;
  secondaryText?: string;
  size?: PersonaProps["size"];
  variant?: "compact" | "full";
  className?: string;
  primaryText?: PersonaProps["primaryText"];
};

const useStyles = makeStyles({
  compact: {
    [`& .${personaClassNames.primaryText}`]: {
      display: "none",
    },
    [`& .${personaClassNames.secondaryText}`]: {
      display: "none",
    },
    [`& .${personaClassNames.tertiaryText}`]: {
      display: "none",
    },
    [`& .${personaClassNames.quaternaryText}`]: {
      display: "none",
    },
  },
  statusOffline: {
    color: tokens.colorNeutralForeground3,
  },
});

export default function ProfilePersona({
  name,
  address,
  secondaryText,
  size = "small",
  variant = "full",
  className,
  primaryText,
}: ProfilePersonaProps) {
  const styles = useStyles();
  const blockieSrc = useMemo(
    () => (address ? makeBlockie(address) : undefined),
    [address],
  );
  const isConnected = Boolean(address);

  return (
    <Persona
      className={mergeClasses(variant === "compact" && styles.compact, className)}
      size={size}
      name={name}
      primaryText={primaryText}
      secondaryText={variant === "full" ? secondaryText : undefined}
      avatar={{
        name,
        image: blockieSrc ? { src: blockieSrc, alt: `${name} wallet avatar` } : undefined,
        color: "neutral",
        active: isConnected ? "active" : "unset",
        activeAppearance: "ring",
      }}
      presence={
        variant === "full"
          ? isConnected
            ? {
                status: "available",
                icon: <AvailableIcon />,
              }
            : {
                status: "offline",
                icon: <OfflineIcon />,
                className: styles.statusOffline,
              }
          : undefined
      }
    />
  );
}
