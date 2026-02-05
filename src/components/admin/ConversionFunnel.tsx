
'use client';

import dynamic from 'next/dynamic';
const Chart = dynamic(() => import('react-apexcharts'), { ssr: false });
import { ApexOptions } from 'apexcharts';

export default function ConversionFunnel({ data }: { data: { name: string, count: number }[] }) {
    const options: ApexOptions = {
        chart: {
            type: 'bar',
            fontFamily: 'inherit',
            toolbar: { show: false }
        },
        plotOptions: {
            bar: {
                borderRadius: 4,
                horizontal: true,
                distributed: true,
                barHeight: '80%',
                dataLabels: {
                    position: 'bottom'
                }
            }
        },
        colors: ['#E2E8F0', '#CBD5E1', '#94A3B8', '#5750F1'],
        dataLabels: {
            enabled: true,
            textAnchor: 'start',
            style: {
                colors: ['#000'],
                fontSize: '10px',
                fontWeight: 900
            },
            formatter: function (val, opt) {
                return opt.w.globals.labels[opt.dataPointIndex] + ":  " + val
            },
            offsetX: 0,
            dropShadow: { enabled: false }
        },
        stroke: { width: 0 },
        grid: { show: false },
        xaxis: {
            categories: data.map(d => d.name),
            labels: { show: false },
            axisBorder: { show: false },
            axisTicks: { show: false }
        },
        yaxis: {
            labels: { show: false }
        },
        tooltip: {
            theme: 'light',
            y: {
                title: { formatter: () => '' }
            }
        }
    };

    const series = [{
        name: 'Users',
        data: data.map(d => d.count)
    }];

    return (
        <div className="h-[300px] w-full">
            <Chart
                options={options}
                series={series}
                type="bar"
                height="100%"
                width="100%"
            />
        </div>
    );
}
