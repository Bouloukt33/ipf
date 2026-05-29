'use client';

import React from 'react';
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import {
    ChartContainer,
    ChartTooltip,
    ChartTooltipContent,
    type ChartConfig,
} from '@/components/ui/chart';

interface Props {
    data: { date: string; sessions: number }[];
}

const config: ChartConfig = {
    sessions: { label: 'Sessions', color: '#D27A2D' },
};

function fmtDate(iso: string) {
    const d = new Date(iso);
    return d.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' });
}

// Show only every 5th label to avoid clutter
function CustomXAxisTick({ x, y, payload, index }: any) {
    if (index % 5 !== 0) return null;
    return (
        <text x={x} y={y + 12} textAnchor="middle" fill="#5a7a99" fontSize={10} fontWeight={600}>
            {fmtDate(payload.value)}
        </text>
    );
}

export function SessionsBarChart({ data }: Props) {
    return (
        <ChartContainer config={config} className="h-[200px] w-full">
            <BarChart data={data} margin={{ top: 4, right: 4, bottom: 4, left: -20 }}>
                <CartesianGrid vertical={false} stroke="rgba(210,122,45,0.08)" />
                <XAxis dataKey="date" tick={<CustomXAxisTick />} axisLine={false} tickLine={false} />
                <YAxis allowDecimals={false} tick={{ fill: '#5a7a99', fontSize: 10, fontWeight: 600 }} axisLine={false} tickLine={false} />
                <ChartTooltip
                    content={
                        <ChartTooltipContent
                            formatter={(value) => [`${value} session${Number(value) !== 1 ? 's' : ''}`, '']}
                            labelFormatter={(label) => fmtDate(label)}
                        />
                    }
                />
                <Bar dataKey="sessions" fill="#D27A2D" radius={[4, 4, 0, 0]} maxBarSize={24} />
            </BarChart>
        </ChartContainer>
    );
}
