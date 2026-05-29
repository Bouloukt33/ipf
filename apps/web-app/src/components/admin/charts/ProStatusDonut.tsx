'use client';

import React from 'react';
import { Pie, PieChart, Cell, Tooltip } from 'recharts';
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from '@/components/ui/chart';

interface Props {
    data: { status: string; label: string; count: number }[];
}

const COLORS = ['#D27A2D', '#1e3a5f', '#10B981', '#7C3AED'];

export function ProStatusDonut({ data }: Props) {
    const total = data.reduce((s, d) => s + d.count, 0);

    const config: ChartConfig = Object.fromEntries(
        data.map((d, i) => [d.status, { label: d.label, color: COLORS[i % COLORS.length] }])
    );

    return (
        <div className="flex items-center gap-6">
            <ChartContainer config={config} className="h-[160px] w-[160px] flex-shrink-0">
                <PieChart>
                    <ChartTooltip
                        content={<ChartTooltipContent formatter={(v, name) => [`${v} utilisateur${Number(v) !== 1 ? 's' : ''}`, config[name as string]?.label ?? name]} />}
                    />
                    <Pie
                        data={data}
                        dataKey="count"
                        nameKey="status"
                        innerRadius={48}
                        outerRadius={72}
                        paddingAngle={3}
                        strokeWidth={0}
                    >
                        {data.map((_, i) => (
                            <Cell key={i} fill={COLORS[i % COLORS.length]} />
                        ))}
                    </Pie>
                </PieChart>
            </ChartContainer>

            {/* Legend */}
            <div className="flex flex-col gap-2.5 flex-1">
                {data.map((d, i) => (
                    <div key={d.status} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: COLORS[i % COLORS.length] }} />
                            <span className="text-[13px] font-semibold text-[#172E42]">{d.label}</span>
                        </div>
                        <div className="text-right">
                            <span className="text-[13px] font-extrabold text-[#172E42]">{d.count}</span>
                            <span className="text-[11px] font-semibold text-[#5a7a99] ml-1">
                                ({total > 0 ? Math.round((d.count / total) * 100) : 0}%)
                            </span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
