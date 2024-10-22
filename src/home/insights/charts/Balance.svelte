<script lang="ts">
    import { Line } from 'svelte-chartjs'
    import { Chart as ChartJS, TimeScale, Title, Tooltip, Legend, LineElement, LinearScale, PointElement, CategoryScale } from "chart.js"
    import 'chartjs-adapter-moment';
    import chartTrendline from 'chartjs-plugin-trendline';
    import type { Transaction } from "../../../types";

    export let transactions: Transaction[];



    ChartJS.register(Title, Tooltip, Legend, LineElement, LinearScale, PointElement, TimeScale, CategoryScale, chartTrendline);

    let options = {
        color: "white",
        backgroundColor: "#111",
        borderColor: "white",
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
                color: 'white',
                ticks: {
                    color: '#ccc'
                },
                grid: {
                    color: '#555'
                }
            },
            y: {
                min: 0,
                color: 'white',
                ticks: {
                    color: '#ccc'
                },
                grid: {
                    color: '#555'
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
                stepped: 'after',
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
                stepped: 'after',
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
                stepped: 'after',
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
                    ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
                    ctx.stroke();
                    ctx.restore(); 
                    }
                }
            },
            chartTrendline
        ]}
    />
</div>