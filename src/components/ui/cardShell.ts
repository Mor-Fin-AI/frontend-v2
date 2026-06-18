import { makeStyles, tokens } from "@fluentui/react-components";

export const CARD_APPEARANCE = "filled-alternative" as const;
export const CARD_FOCUS_MODE = "off" as const;

export const useCardShellStyles = makeStyles({
  shell: {
    width: "100%",
    boxSizing: "border-box",
    color: tokens.colorNeutralForeground1,
    border: `1px solid ${tokens.colorNeutralStroke2}`,
    borderRadius: tokens.borderRadiusLarge,
    boxShadow: tokens.shadow2,
  },
  caption: {
    color: tokens.colorNeutralForeground3,
  },
  iconWrap: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    width: "42px",
    height: "42px",
    borderRadius: tokens.borderRadiusMedium,
    flexShrink: 0,
    backgroundColor: tokens.colorNeutralBackground3,
    color: tokens.colorNeutralForeground2,
  },
  topBarIcon: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    width: "32px",
    height: "32px",
    borderRadius: tokens.borderRadiusSmall,
    flexShrink: 0,
    backgroundColor: tokens.colorNeutralBackground3,
    color: tokens.colorNeutralForeground2,
  },
});
