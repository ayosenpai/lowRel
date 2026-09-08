'use client';

import dynamic from 'next/dynamic';
const Chart = dynamic(() => import('react-apexcharts'), { ssr: false });
import { ApexOptions } from 'apexcharts';

export default function RevenueChart({
    data,
    symbol,
}: {
    data: { date: string; revenue: number; visitors: number; orders: number }[];
    symbol: string;
}) {
    const options: ApexOptions = {
        chart: {
            fontFamily: 'inherit',
            type: 'line',
            toolbar: { show: false },
            zoom: { enabled: false },
        },
        colors: ['#d8a4bc', '#0F172A'],
        dataLabels: { enabled: false },
        stroke: { curve: 'smooth', width: [3, 0] },
        fill: {
            type: 'gradient',
            gradient: { shadeIntensity: 1, opacityFrom: 0.35, opacityTo: 0.03, stops: [20, 100] },
        },
        grid: {
            borderColor: '#ECE9E4',
            strokeDashArray: 4,
            padding: { left: 0, right: 0 },
        },
        markers: {
            size: 0,
            colors: ['#d8a4bc'],
            strokeColors: '#FFFFFF',
            strokeWidth: 2,
            hover: { size: 5 },
        },
        plotOptions: {
            bar: {
                columnWidth: '45%',
                borderRadius: 4,
            },
        },
        xaxis: {
            categories: data.map(d => d.date),
            axisBorder: { show: false },
            axisTicks: { show: false },
            labels: { style: { colors: '#9CA3AF', fontSize: '11px', fontWeight: 600 } },
        },
        yaxis: [
            {
                labels: {
                    style: { colors: '#9CA3AF', fontSize: '11px', fontWeight: 600 },
                    formatter: (val: number) => `${symbol}${val}`,
                },
            },
            {
                opposite: true,
                labels: {
                    style: { colors: '#9CA3AF', fontSize: '11px', fontWeight: 600 },
                    formatter: (val: number) => `${Math.round(val)}`,
                },
            },
        ],
        tooltip: {
            theme: 'light',
            shared: true,
            intersect: false,
            y: [
                { formatter: (val: number) => `${symbol}${val.toFixed(2)}` },
                { formatter: (val: number) => `${val} orders` },
            ],
        },
        legend: { show: false },
    };

    return (
        <Chart
            options={options}
            series={[
                { name: 'Revenue', type: 'area', data: data.map(d => d.revenue) },
                { name: 'Orders', type: 'bar', data: data.map(d => d.orders) },
            ]}
            type="line"
            height="340"
            width="100%"
        />
    );
}
