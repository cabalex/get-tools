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
                    color: getComputedStyle(document.documentElement).getPropertyValue('--text-color')
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

            for (let key of Object.keys(transactionData)) {
                if (key === "GET" || key.startsWith("Deposit")) {
                    delete transactionData[key];
                }
            }

            let sortedLabels = Object.keys(transactionData)
                .sort((a, b) => transactionData[b] - transactionData[a]);
            let other = sortedLabels.slice(7).reduce((acc, label) => acc + transactionData[label], 0);
            
            const labels = sortedLabels.slice(0, 7);
            const newData = labels.map(x => transactionData[x]);
            const newColors = Object.keys(transactionData).map((_, i) => `hsl(${i * 360 / Object.keys(transactionData).length}, 50%, 50%)`);
            if (other) {
                labels.push("Other");
                newData.push(other);
                newColors.push("hsl(0, 0%, 50%)");
            }

            const newDataset = {
                data: newData,
                backgroundColor: newColors
            }

            if (JSON.stringify(data.labels) !== JSON.stringify(labels)) {
                data.labels = labels;
            }
            if (JSON.stringify(data.datasets[0]) !== JSON.stringify(newDataset)) {
                data.datasets[0] = newDataset;
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