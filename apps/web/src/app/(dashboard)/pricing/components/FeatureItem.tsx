import { Checkmark24Regular } from "@fluentui/react-icons";

export function FeatureItem({ text }: { text: string }) {
  return (
    <li className="flex items-start gap-2 text-sm font-normal text-muted-foreground">
      <Checkmark24Regular className="mt-0.5 h-4 w-4 shrink-0 text-[var(--action-green)]" />
      {text}
    </li>
  );
}
