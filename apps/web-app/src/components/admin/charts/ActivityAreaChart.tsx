'use client';

import React from 'react';
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from 'recharts';
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from '@/components/ui/chart';

interface Props {
    data: { date: string; count: number }[];
}

const config: ChartConfig = {
    count: { label: 'Sessions', color: '#D27A2D' },
};

function fmtDate(iso: string) {
    const d = new Date(iso);
    return d.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' });
}

function CustomXAxisTick({ x, y, payload, index }: any) {
    if (index % 5 !== 0) return null;
    return (
        <text x={x} y={y + 12} textAnchor="middle" fill="#5a7a99" fontSize={10} fontWeight={600}>
            {fmtDate(payload.value)}
        </text>
    );
}

export function ActivityAreaChart({ data }: Props) {
    return (
        <ChartContainer config={config} className="h-[160px] w-full">
            <AreaChart data={data} margin={{ top: 4, right: 4, bottom: 4, left: -20 }}>
                <defs>
                    <linearGradient id="activityGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%"  stopColor="#D27A2D" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#D27A2D" stopOpacity={0} />
                    </linearGradient>
                </defs>
                <CartesianGrid vertical={false} stroke="rgba(210,122,45,0.08)" />
                <XAxis dataKey="date" tick={<CustomXAxisTick />} axisLine={false} tickLine={false} />
                <YAxis allowDecimals={false} tick={{ fill: '#5a7a99', fontSize: 10, fontWeight: 600 }} axisLine={false} tickLine={false} />
                <ChartTooltip
                    content={
                        <ChartTooltipContent
                            formatter={(v) => [`${v} session${Number(v) !== 1 ? 's' : ''}`, '']}
                            labelFormatter={(l) => fmtDate(l)}
                        />
                    }
                />
                <Area
                    type="monotone"
                    dataKey="count"
                    stroke="#D27A2D"
                    strokeWidth={2}
                    fill="url(#activityGradient)"
                    dot={false}
                    activeDot={{ r: 4, fill: '#D27A2D' }}
                />
            </AreaChart>
        </ChartContainer>
    );
}
