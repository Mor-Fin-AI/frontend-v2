'use client';

import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Legend,
} from 'recharts';
import { useFluentThemeColors } from '@/hooks/useFluentThemeColors';
import { activityChartData } from '../data';
import ChartSkeleton from '@/components/ui/skeletons/ChartSkeleton';
import PanelCard, { PanelCardBody, PanelCardHeader } from '@/components/ui/PanelCard';
import NeuButton from '@/components/ui/NeuButton';

export default function ActivityChart({ isLoading = false }: { isLoading?: boolean }) {
    const theme = useFluentThemeColors();

    return (
        <PanelCard aria-busy={isLoading}>
            <PanelCardHeader
                title="Active Trainings"
                action={
                    <NeuButton variant="secondary" size="sm">
                        Last 6 Months
                    </NeuButton>
                }
            />

            <PanelCardBody>
            {isLoading ? (
                <ChartSkeleton minHeight={300} aria-label="Loading activity chart" />
            ) : (
            <div className="w-full h-[300px] focus:outline-none [&_*]:focus:outline-none">
                <ResponsiveContainer width="100%" height="100%" minWidth={0}>
                    <BarChart
                        data={activityChartData}
                        margin={{ top: 10, right: 0, left: 0, bottom: 0 }}
                        barGap={6}
                        barCategoryGap="10%"
                    >
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={theme.colorNeutralStroke2} />
                        <XAxis
                            dataKey="month"
                            axisLine={false}
                            tickLine={false}
                            tick={{ fill: theme.colorNeutralForeground3, fontSize: 10, fontFamily: 'Inter' }}
                        />
                        <YAxis
                            axisLine={false}
                            tickLine={false}
                            tick={{ fill: theme.colorNeutralForeground3, fontSize: 10, fontFamily: 'Inter' }}
                        />
                        <Tooltip
                            contentStyle={{
                                backgroundColor: theme.colorNeutralBackground2,
                                borderColor: theme.colorNeutralStroke2,
                                borderRadius: '8px',
                                color: theme.colorNeutralForeground1,
                            }}
                            cursor={{ fill: 'transparent' }}
                        />
                        <Legend
                            verticalAlign="bottom"
                            height={36}
                            content={(props: any) => {
                                const { payload } = props;
                                return (
                                    <div className="flex flex-row justify-center items-center p-0 gap-1 md:gap-3 lg:gap-5 w-full">
                                        {payload?.map((entry: any, index: number) => (
                                            <div key={`item-${index}`} className="flex flex-row items-center p-0 gap-2">
                                                <div
                                                    className="w-2 h-2 rounded-full flex-none"
                                                    style={{ backgroundColor: entry.color }}
                                                />
                                                <span className="font-inter font-medium text-[10px] md:text-sm leading-4 text-foreground flex items-center">
                                                    {entry.value}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                );
                            }}
                        />
                        <Bar dataKey="learning" name="Learning Activities" fill="#22C38E" radius={[6, 6, 0, 0]} />
                        <Bar dataKey="community" name="Community Engagement" fill="#30ABE8" radius={[6, 6, 0, 0]} />
                        <Bar dataKey="training" name="Training Programs" fill="#F69E23" radius={[6, 6, 0, 0]} />
                    </BarChart>
                </ResponsiveContainer>
            </div>
            )}
            </PanelCardBody>
        </PanelCard>
    );
}
