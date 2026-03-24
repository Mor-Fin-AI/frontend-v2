import { PricingStat } from "../data";

export function StatItem({ stat }: { stat: PricingStat }) {
  return (
    <div className="flex flex-col items-center justify-center text-center py-5 sm:py-6 px-3 sm:px-6">
      
      <span className={`text-lg sm:text-xl xl:text-2xl font-bold ${stat.valueColor}`}>
        {stat.value}
      </span>

      <span className="mt-1 text-[10px] sm:text-xs uppercase tracking-wider text-[#737B9C]">
        {stat.label}
      </span>

    </div>
  );
}