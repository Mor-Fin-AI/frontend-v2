'use client';

import { LucideIcon, TrendingUp, TrendingDown } from 'lucide-react';
import CountUp from 'react-countup';
import clsx from 'clsx';

type Variant = 'default' | 'success' | 'warning' | 'danger';

interface CardProps {
  title: string;
  value: React.ReactNode;
  valueColor?: string;

  /** optional subtitle / trend label shown below the value */
  subtitle?: string;
  subtitleColor?: string;

  icon: React.ElementType;

  /** states */
  isLoading?: boolean;

  /** numeric trend percentage – renders a badge */
  trend?: number;

  /** variant */
  variant?: Variant;

  /** formatting for CountUp (only when value is number) */
  prefix?: string;
  suffix?: string;

  /** background image */
  bgImage?: string;

  iconBg?: string;
  iconColor?: string;

  /** trend layout and styling */
  trendPosition?: 'right' | 'bottom';
  trendVariant?: 'badge' | 'text';

  className?: string;
}

const VARIANT_STYLES: Record<Variant, string> = {
  default: 'border-[#FFFFFF1A]',
  success: 'border-[#22C55E33]',
  warning: 'border-[#F9731633]',
  danger: 'border-[#EF444433]',
};

export default function Card({
  title,
  value,
  valueColor = 'text-white',
  subtitle,
  subtitleColor = 'text-emerald-400',
  icon: Icon,
  isLoading = false,
  trend,
  variant = 'default',
  prefix = '',
  suffix = '',
  bgImage = '/Image/card-background.png',
  iconBg = 'bg-white/10',
  iconColor = 'text-white',
  trendPosition = 'right',
  trendVariant = 'badge',
  className,
}: CardProps) {
  const isPositive = typeof trend === 'number' && trend > 0;

  return (
    <div
      className={clsx(
        'relative flex items-start justify-between rounded-2xl p-4 xl:p-5 border border-[#FFFFFF33] bg-no-repeat bg-cover bg-center overflow-hidden',
        VARIANT_STYLES[variant],
        className
      )}
      style={{
        backgroundImage: bgImage !== 'none' ? `url('${bgImage}')` : undefined,
      }}
    >
      {/* Left: Content */}
      <div className="flex flex-col gap-1 flex-1 min-w-0 ">
        {isLoading ? (
          <>
            <div className="h-3 w-24 rounded bg-white/10 animate-pulse" />
            <div className="h-7 w-32 rounded bg-white/10 animate-pulse mt-1" />
            <div className="h-3 w-20 rounded bg-white/10 animate-pulse mt-1" />
          </>
        ) : (
          <>
            {/* Title */}
            <span className="text-sm font-medium text-white font-inter">
              {title}
            </span>

            {/* Value row */}
            <div className={clsx(
              "flex mt-1",
              trendPosition === 'right' ? "items-center gap-2" : "flex-col gap-2.5"
            )}>
              <span className={clsx('text-2xl font-bold font-inter leading-8', valueColor)}>
                {typeof value === 'number' ? (
                  <CountUp
                    end={value}
                    duration={1.2}
                    separator=","
                    prefix={prefix}
                    suffix={suffix}
                  />
                ) : (
                  value
                )}
              </span>

              {/* Numeric trend badge/text */}
              {typeof trend === 'number' && (
                <span
                  className={clsx(
                    'flex items-center gap-1.5 text-xs font-medium transition-all font-inter leading-4',
                    trendVariant === 'badge' ? 'rounded-full px-2 py-0.5 border' : '',
                    isPositive
                      ? clsx('text-[#4ADE80]', trendVariant === 'badge' && 'bg-emerald-500/10 border-emerald-500/20')
                      : clsx('text-[#EF4444]', trendVariant === 'badge' && 'bg-red-500/10 border-red-500/20')
                  )}
                >
                  {isPositive ? (
                    <TrendingUp className="h-4 w-4" />
                  ) : (
                    <TrendingDown className="h-4 w-4" />
                  )}
                  {Math.abs(trend)}%
                </span>
              )}
            </div>

            {/* Subtitle */}
            {subtitle && (
              <span className={clsx('text-[10px] font-inter font-medium mt-0', subtitleColor)}>
                {subtitle}
              </span>
            )}
          </>
        )}
      </div>

      {/* Right: Icon */}
      <div
        className={clsx(
          'flex h-10.5 w-10.5 items-center justify-center rounded-lg shrink-0 ml-3',
          iconBg
        )}
      >
        <Icon className={clsx('h-5.5 w-5.5', iconColor)} />
      </div>
    </div>
  );
}
