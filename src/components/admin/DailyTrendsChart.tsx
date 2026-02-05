
'use client';

import dynamic from 'next/dynamic';
const Chart = dynamic(() => import('react-apexcharts'), { ssr: false });
import { ApexOptions } from 'apexcharts';

export default function DailyTrendsChart({ data }: { data: any[] }) {
    const options: ApexOptions = {
        chart: {
            fontFamily: 'inherit',
            type: 'line',
            toolbar: { show: false },
            zoom: { enabled: false }
        },
        colors: ['#64748B', '#5750F1', '#22AD5C'],
        dataLabels: { enabled: false },
        stroke: { curve: 'smooth', width: [2, 3, 3], dashArray: [5, 0, 0] },
        legend: {
            position: 'top',
            horizontalAlign: 'right',
            fontSize: '10px',
            fontWeight: 700,
            markers: { size: 4 }
        },
        grid: {
            borderColor: '#F1F5F9',
            strokeDashArray: 4
        },
        xaxis: {
            categories: data.map(d => d.date),
            labels: {
                style: { colors: '#64748B', fontSize: '10px', fontWeight: 600 }
            },
            axisBorder: { show: false },
            axisTicks: { show: false }
        },
        yaxis: {
            labels: {
                style: { colors: '#64748B', fontSize: '10px', fontWeight: 600 }
            }
        },
        tooltip: {
            theme: 'light',
            x: { show: true }
        }
    };

    const series = [
        { name: 'Views', data: data.map(d => d.views) },
        { name: 'Intent', data: data.map(d => d.intent) },
        { name: 'Sales', data: data.map(d => d.sales) }
    ];

    return (
        <div className="h-[350px] w-full">
            <Chart
                options={options}
                series={series}
                type="line"
                height="100%"
                width="100%"
            />
        </div>
    );
}
