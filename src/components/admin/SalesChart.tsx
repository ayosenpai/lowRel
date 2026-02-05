
'use client';

import dynamic from 'next/dynamic';
const Chart = dynamic(() => import('react-apexcharts'), { ssr: false });
import { ApexOptions } from 'apexcharts';

export default function SalesChart({ data }: { data: any[] }) {
    const options: ApexOptions = {
        chart: {
            fontFamily: 'inherit',
            type: 'area',
            toolbar: { show: false },
            zoom: { enabled: false }
        },
        colors: ['#5750F1', '#0ABEF9'],
        dataLabels: { enabled: false },
        stroke: { curve: 'smooth', width: 3 },
        fill: {
            type: 'gradient',
            gradient: {
                shadeIntensity: 1,
                opacityFrom: 0.45,
                opacityTo: 0.05,
                stops: [20, 100]
            }
        },
        grid: {
            show: true,
            borderColor: '#E2E8F0',
            strokeDashArray: 4,
            padding: { left: 0, right: 0, top: 0, bottom: 0 }
        },
        xaxis: {
            categories: data.map(d => d.date),
            axisBorder: { show: false },
            axisTicks: { show: false },
            labels: {
                style: {
                    colors: '#64748B',
                    fontSize: '12px',
                    fontWeight: 500
                }
            }
        },
        yaxis: {
            labels: {
                style: {
                    colors: '#64748B',
                    fontSize: '12px',
                    fontWeight: 500
                },
                formatter: (val) => `$${val}`
            }
        },
        tooltip: {
            theme: 'light',
            x: { show: true },
            y: { formatter: (val) => `$${val.toFixed(2)}` }
        }
    };

    const series = [{
        name: 'Revenue',
        data: data.map(d => d.amount)
    }];

    return (
        <div className="h-[350px] w-full">
            <Chart
                options={options}
                series={series}
                type="area"
                height="100%"
                width="100%"
            />
        </div>
    );
}
