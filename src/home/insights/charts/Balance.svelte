<script lang="ts">
    import { Line } from 'svelte-chartjs'
    import { Chart as ChartJS, TimeScale, Title, Tooltip, Legend, LineElement, LinearScale, PointElement, CategoryScale } from "chart.js"
    import 'chartjs-adapter-date-fns';
    import chartTrendline from 'chartjs-plugin-trendline';
    import type { Transaction } from "../../../types";

    export let transactions: Transaction[];

    let firstDate = transactions.length ? new Date(transactions[transactions.length - 1].actualDate) : new Date();

    let chartView: "all" | "30d" | "7d" | "3d" | "1d" = "all";

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
                max: new Date(firstDate?.getTime() + 1000 * 60 * 60 * 24 * 7 * 10),
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
                tension: 0.1,
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
                data: transactions.filter(x => x.accountName === "Banana Bucks").map(transaction => ({ x: new Date(transaction.actualDate), y: transaction.resultingBalance })),
                fill: false,
                borderColor: 'rgb(253, 199, 0)',
                points: false,
                tension: 0.1,
                pointRadius: 0,
            },
            {
                label: 'Flexi Dollars',
                data: transactions.filter(x => x.accountName === "Flexi Dollars").map(transaction => ({ x: new Date(transaction.actualDate), y: transaction.resultingBalance })),
                fill: false,
                borderColor: '#93c02d',
                points: false,
                tension: 0.1,
                pointRadius: 0,
            }
        ]
    }
    
    $: {
        data.datasets[0].data = transactions.map(transaction => ({ x: new Date(transaction.actualDate), y: transaction.resultingBalance }));

        switch(chartView) {
            case "30d":
                data.datasets = data.datasets.map(dataset => {
                    dataset.data = dataset.data.filter(point => point.x.getTime() > Date.now() - 30 * 24 * 60 * 60 * 1000);
                    
                    dataset.data.unshift({
                        x: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
                        y: dataset.data[0]?.y
                    })
                    
                    return dataset;
                })
                break;
            case "7d":
                data.datasets = data.datasets.map(dataset => {
                    dataset.data = dataset.data.filter(point => point.x.getTime() > Date.now() - 7 * 24 * 60 * 60 * 1000);
                    
                    dataset.data.unshift({
                        x: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
                        y: dataset.data[0]?.y
                    })
                    
                    return dataset;
                })
                break;
            case "3d":
                data.datasets = data.datasets.map(dataset => {
                    dataset.data = dataset.data.filter(point => point.x.getTime() > Date.now() - 3 * 24 * 60 * 60 * 1000);
                    
                    dataset.data.unshift({
                        x: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
                        y: dataset.data[0]?.y
                    })
                    
                    return dataset;
                })
                break;
            case "1d":
                data.datasets = data.datasets.map(dataset => {
                    dataset.data = dataset.data.filter(point => point.x.getTime() > Date.now() - 24 * 60 * 60 * 1000);
                    
                    dataset.data.unshift({
                        x: new Date(Date.now() - 24 * 60 * 60 * 1000),
                        y: dataset.data[0]?.y
                    })
                    
                    return dataset;
                })
                break;
            default:
                data.datasets = data.datasets.map(dataset => {
                    dataset.data.unshift({
                        x: new Date(),
                        y: dataset.data[0]?.y,
                    })
                    
                    return dataset;
                })
                break;
        }
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