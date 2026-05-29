'use client';

import React from 'react';
import { Bar, BarChart, XAxis, YAxis, Cell } from 'recharts';
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from '@/components/ui/chart';

interface DataItem {
    category: string;
    color:    string;
    count:    number;
    accuracy?: number;
}

interface Props {
    data:      DataItem[];
    dataKey?:  'count' | 'accuracy';
    label?:    string;
    suffix?:   string;
}

export function CategoryHBarChart({ data, dataKey = 'count', label = 'Questions', suffix = '' }: Props) {
    const config: ChartConfig = { [dataKey]: { label } };

    return (
        <ChartContainer config={config} className="w-full" style={{ height: `${Math.max(120, data.length * 40)}px` }}>
            <BarChart
                layout="vertical"
                data={data}
                margin={{ top: 0, right: 8, bottom: 0, left: 0 }}
                barCategoryGap="25%"
            >
                <XAxis
                    type="number"
                    tick={{ fill: '#5a7a99', fontSize: 10, fontWeight: 600 }}
                    axisLine={false}
                    tickLine={false}
                    tickFormatter={(v) => `${v}${suffix}`}
                />
                <YAxis
                    type="category"
                    dataKey="category"
                    width={130}
                    tick={{ fill: '#172E42', fontSize: 12, fontWeight: 700 }}
                    axisLine={false}
                    tickLine={false}
                    tickFormatter={(v: string) => v.length > 18 ? v.slice(0, 17) + '…' : v}
                />
                <ChartTooltip
                    content={
                        <ChartTooltipContent
                            formatter={(v) => [`${v}${suffix}`, label]}
                            labelKey="category"
                        />
                    }
                />
                <Bar dataKey={dataKey} radius={[0, 4, 4, 0]} maxBarSize={20}>
                    {data.map((d, i) => (
                        <Cell key={i} fill={d.color || '#D27A2D'} />
                    ))}
                </Bar>
            </BarChart>
        </ChartContainer>
    );
}
