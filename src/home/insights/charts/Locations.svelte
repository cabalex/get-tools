<script lang="ts">
    import { Doughnut } from 'svelte-chartjs';
    import type { Transaction } from '../../../types';

    export let transactions: Transaction[];

    const data = {
        labels: ["Unknown"],
        datasets: [{
            data: [1],
            backgroundColor: ["#fff"]
        }]
    }

    const options = {
        responsive: true,
        maintainAspectRatio: false,
        borderColor: "#111",
        plugins: {
            legend: {
                position: window.innerWidth < 500 ? "bottom" : "right",
                labels: {
                    color: "#eeeeee"
                }
            }
        }
    }

    $: {
        if (transactions) {
            let transactionData: {[key: string]: number} = {};
            for (let transaction of transactions) {
                let name = transaction.friendlyName;
                if (!transactionData[name]) transactionData[name] = 0;
                transactionData[name] += transaction.amount;
            }

            let sortedLabels = Object.keys(transactionData).sort((a, b) => transactionData[b] - transactionData[a]);
            let other = sortedLabels.slice(7).reduce((acc, label) => acc + transactionData[label], 0);
            data.labels = [...sortedLabels.slice(0, 7)];
            data.datasets[0] = {
                data: data.labels.map(x => transactionData[x]),
                backgroundColor: Object.keys(transactionData).map((_, i) => `hsl(${i * 360 / Object.keys(transactionData).length}, 50%, 50%)`)
            }

            if (other) {
                data.labels.push("Other");
                data.datasets[0].data.push(other);
                data.datasets[0].backgroundColor.push("hsl(0, 0%, 50%)");
            }
        }
    }
  
    import {
      Chart as ChartJS,
      Title,
      Tooltip,
      Legend,
      ArcElement,
      CategoryScale,
    } from 'chart.js';
  
    ChartJS.register(Title, Tooltip, Legend, ArcElement, CategoryScale);
</script>

<div class="chart">
    <Doughnut {data} options={options} />
</div>