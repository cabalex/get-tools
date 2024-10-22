<script lang="ts">
    import type { Transaction } from '../../types';
    import Balance from './charts/Balance.svelte';
    import Locations from './charts/Locations.svelte';

    export let transactions: Transaction[];

    let startingBalance = transactions[transactions.length - 1].resultingBalance;

    function spending() {
        let dayAmount = (new Date().getTime() - new Date(transactions[transactions.length - 1].actualDate).getTime()) / (1000 * 60 * 60 * 24);
        let days: {[key: string]: number} = {};
        for (let transaction of transactions) {
            let date = transaction.actualDate.slice(0, 10);
            if (!days[date]) days[date] = 0;
            days[date] += transaction.amount;
        }
        return Object.values(days).reduce((acc, amount) => acc + amount, 0) / dayAmount;
    }

    function color() {
        let average = spending() * 7 * 10;
        
        if (startingBalance - average < 0) return "red";
        if (startingBalance - average < startingBalance / 2) return "orange";
        return "lime";
    }

    const MEAL_COST = 12.23;
    function mealsLeft() {
        let endDate = new Date(new Date(transactions[transactions.length - 1].actualDate).getTime() + 10.5 * 7 * 24 * 60 * 60 * 1000);
        let timeLeft = (endDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24);
        let moneyLeft = transactions[0].resultingBalance / timeLeft;
        return moneyLeft / MEAL_COST;
    }

    function mealColor() {
        let meals = mealsLeft();
        if (meals < 1) return "red";
        if (mealsLeft() < 2) return "orange";
        return "lime";
    
    }

</script>

<h2>You're spending approx. <span style="color: {color()}">${spending().toFixed(2)}</span> per day.</h2>
<h3>With this balance, you can eat <span style="color: {mealColor()}">{Math.max(0, mealsLeft()).toFixed(2)}</span> meals per day ({Math.floor(transactions[0].resultingBalance / MEAL_COST)} meals).</h3>
<div class="charts">
    <Balance transactions={transactions} />
    <Locations transactions={transactions} />
</div>

<style>
    .charts {
        display: flex;
        height: 300px;
        width: 100%;
        gap: 10px;
    }
    h2, h3 {
        margin: 0;
    }
    h2 {
        margin-top: 5px;
    }
    h3 {
        font-weight: 500;
        margin-bottom: 10px;
    }
    :global(.chart) {
        width: 100%;
        min-height: 300px;
        flex-shrink: 1;
        display: flex;
        overflow: hidden;
        justify-content: center;
    }
    @media screen and (max-width: 900px) {
        .charts {
            flex-direction: column;
            height: unset;
        }
    }
</style>