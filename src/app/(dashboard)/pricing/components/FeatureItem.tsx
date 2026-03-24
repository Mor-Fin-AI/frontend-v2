import { Check} from "lucide-react";

export function FeatureItem({ text, accentColor }: { text: string; accentColor: string }) {
  return (
    <li className="flex items-start gap-2 text-sm font-inter font-normal text-[#7880A4]">
      <Check 
        className="w-4 h-4 mt-0.5 shrink-0 rounded-full p-1" 
        style={{
          color: accentColor,
          backgroundColor: `${accentColor}0D`
        }}
      />
      <span>{text}</span>
    </li>
  );
}
