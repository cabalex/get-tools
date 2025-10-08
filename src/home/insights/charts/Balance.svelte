<script lang="ts">
    import { Line } from 'svelte-chartjs'
    import { Chart as ChartJS, TimeScale, Title, Tooltip, Legend, LineElement, LinearScale, PointElement, CategoryScale } from "chart.js"
    import 'chartjs-adapter-moment';
    import chartTrendline from 'chartjs-plugin-trendline';
    import type { Transaction } from "../../../types";

    export let transactions: Transaction[];



    ChartJS.register(Title, Tooltip, Legend, LineElement, LinearScale, PointElement, TimeScale, CategoryScale, chartTrendline);

    let options = {
        color: getComputedStyle(document.documentElement).getPropertyValue('--text-color'),
        backgroundColor: getComputedStyle(document.documentElement).getPropertyValue('--background-color'),
        borderColor: getComputedStyle(document.documentElement).getPropertyValue('--text-color'),
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            tooltip: {
                mode: 'index',
                intersect: false
            },
            verticalLiner: {}
        },
        hover: {
            mode: 'index',
            intersect: false
        },
        scales: {
            x: {
                type: 'time',
                color: getComputedStyle(document.documentElement).getPropertyValue('--text-color'),
                ticks: {
                    color: getComputedStyle(document.documentElement).getPropertyValue('--text-color')
                },
                grid: {
                    color: getComputedStyle(document.documentElement).getPropertyValue('--grid-color')
                }
            },
            y: {
                min: 0,
                color: getComputedStyle(document.documentElement).getPropertyValue('--text-color'),
                ticks: {
                    color: getComputedStyle(document.documentElement).getPropertyValue('--text-color')
                },
                grid: {
                    color: getComputedStyle(document.documentElement).getPropertyValue('--grid-color')
                }
            }
        },
        cubicInterpolationMode: "monotone",
    }
    let data = {
        labels: [],
        datasets: [
            {
                label: 'Slug Points',
                data: transactions.filter(x => x.accountName === "Slug Points").map(transaction => ({ x: new Date(transaction.actualDate), y: transaction.resultingBalance })),
                fill: false,
                borderColor: 'rgb(75, 192, 192)',
                points: false,
                tension: 1,
                stepped: 'before',
                pointRadius: 0,
                trendlineLinear: {
                    colorMin: "gray",
                    colorMax: "gray",
                    lineStyle: "dotted",
                    width: 2,
                    projection: true
                }
            },
            {
                label: 'Banana Bucks',
                data: transactions.filter(x => x.accountName === "Banana Bucks").map(transaction => ({ x: new Date(transaction.actualDate), y: transaction.resultingBalance || 0 })),
                fill: false,
                borderColor: 'rgb(253, 199, 0)',
                points: false,
                stepped: 'before',
                pointRadius: 0,
                trendlineLinear: {
                    colorMin: "gray",
                    colorMax: "gray",
                    lineStyle: "dotted",
                    width: 2,
                    projection: true
                }
            },
            {
                label: 'Flexi Dollars',
                data: transactions.filter(x => x.accountName === "Flexi Dollars").map(transaction => ({ x: new Date(transaction.actualDate), y: transaction.resultingBalance || 0 })),
                fill: false,
                borderColor: '#93c02d',
                points: false,
                stepped: 'before',
                pointRadius: 0,
                trendlineLinear: {
                    colorMin: "gray",
                    colorMax: "gray",
                    lineStyle: "dotted",
                    width: 2,
                    projection: true
                }
            }
        ]
    }

    data.datasets = data.datasets.filter(x => x.data.length > 0);
    for (let dataset of data.datasets) {
        dataset.data = dataset.data.sort((a, b) => a.x - b.x);
        dataset.data.push({ x: new Date(), y: dataset.data[dataset.data.length - 1].y });
    }
</script>

<div class="chart">
    <Line
        data={data}
        options={options}
        plugins={[
            {
                id: 'verticalLiner',
                afterDraw: chart => {
                    // https://stackoverflow.com/questions/72998998/how-to-make-vertical-line-when-hovering-cursor-chart-js
                    if (chart.tooltip?._active?.length) {
                    let x = chart.tooltip._active[0].element.x;
                    let yAxis = chart.scales.y;
                    let ctx = chart.ctx;
                    ctx.save();
                    ctx.beginPath();
                    ctx.moveTo(x, yAxis.top);
                    ctx.lineTo(x, yAxis.bottom);
                    ctx.lineWidth = 2;
                    ctx.strokeStyle = getComputedStyle(document.documentElement).getPropertyValue('--text-color');
                    ctx.stroke();
                    ctx.restore(); 
                    }
                }
            },
            chartTrendline
        ]}
    />
</div>   