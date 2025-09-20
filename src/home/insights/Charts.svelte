<script lang="ts">
    import { fade } from "svelte/transition";
    import type { Transaction } from '../../types';
    import Balance from './charts/Balance.svelte';
    import Locations from './charts/Locations.svelte';

    export let transactions: Transaction[];

    let startingBalance = transactions.length === 0 ? 0 : transactions[transactions.length - 1].resultingBalance;

    function spending() {
        if (transactions.length === 0) return 0;
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

    const MIN_MEAL_COST = 12.60;
    const MAX_MEAL_COST = 14.70;
    let endDate = new Date(new Date().getTime() + 11.5 * 7 * 24 * 60 * 60 * 1000);
    let timeLeft = (endDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24);
    function mealsLeft() {
        if (transactions.length === 0) return [0, 0];
        let moneyLeft = transactions[0].resultingBalance / timeLeft;
        return [moneyLeft / MIN_MEAL_COST, moneyLeft / MAX_MEAL_COST];
    }

    function printMPD() {
        let meals = mealsLeft();
        if (meals[0].toFixed(2) === meals[1].toFixed(2)) return Math.max(0, meals[0]).toFixed(2);
        return `~${((Math.max(0, meals[1]) + Math.max(0, meals[0])) / 2).toFixed(2)}`;
    }

    function printMealsLeft() {
        if (transactions.length > 0) {
            let min = Math.floor(transactions[0].resultingBalance / MIN_MEAL_COST);
            let max = Math.floor(transactions[0].resultingBalance / MAX_MEAL_COST);
            if (min === max) return min;
            return Math.round(min + max / 2);
        }
        return 0;
    }
    
    function mealColor() {
        let meals = mealsLeft()[1];
        if (meals < 1) return "red";
        if (meals < 2) return "orange";
        return "lime";
    
    }

    let advancedModalOpen = false;
</script>

<h2>You're spending approx. <span style="color: {color()}">${spending().toFixed(2)}</span> per day.</h2>
<h3>With this balance, you can eat <span style="color: {mealColor()}">{printMPD()}</span> meals per day (~{printMealsLeft()} meals). </h3>
<!-- svelte-ignore a11y-no-static-element-interactions -->
<!-- svelte-ignore a11y-missing-attribute -->
<a on:click={() => advancedModalOpen = true}>Why is this approximate?</a>
<div class="charts">
    <Balance transactions={transactions} />
    <Locations transactions={transactions} />
</div>

{#if advancedModalOpen}
    <!-- svelte-ignore a11y-no-static-element-interactions -->
    <div class="modal" on:click={() => advancedModalOpen = false} transition:fade={{duration: 100}}>
        <!-- svelte-ignore a11y-no-static-element-interactions -->
        <div class="modalInner" on:click={(e) => e.stopPropagation()}>
            <h2>About spending analytics</h2>
            <p style="margin-top: 0">As of 2025, meal prices vary based on time of meal (Breakfast, Lunch, Dinner, Late Night). When you eat determines how many "swipes" you can do.</p>
            <p>All analytics assume an end date of <b>{endDate.toLocaleDateString()}</b>. This date is auto-detected by when points are added to your account, and may be inaccurate.</p>
            <p>Meal prices may become out of date; check <a href="https://dining.ucsc.edu/plans-pricing/entry/" rel="noopener noreferrer" target="_blank">the dining website</a> for the most accurate information.</p>
            <div class="fact">
                <b>Meal price</b>
                <span>${MIN_MEAL_COST.toFixed(2)} - ${MAX_MEAL_COST.toFixed(2)}</span>
            </div>
            {#if transactions.length > 0}
            <div class="fact">
                <b>Meals left</b>
                <span>{Math.floor(transactions[0].resultingBalance / MAX_MEAL_COST)} - {Math.floor(transactions[0].resultingBalance / MIN_MEAL_COST)}</span>
            </div>
            {/if}
            <div class="fact">
                <b>Meals per day</b>
                <span>{mealsLeft().reverse().map(x => x.toFixed(2)).join(" - ")}</span>
            </div>
        </div>
    </div>
{/if}

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
    }
    a:not(.modal a) {
        font-size: 12px;
        display: block;
        margin-bottom: 10px;
        cursor: pointer;
    }
    .modal {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background-color: rgba(0, 0, 0, 0.5);
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        z-index: 100;
    }
    .modalInner {
        background-color: white;
        color: black;   
        padding: 20px;
        border-radius: 10px;
        box-shadow: 0 0 10px rgba(0, 0, 0, 0.5);
        max-width: 400px;
        position: relative;
    }
    .fact {
        display: flex;
        align-items: center;
        gap: 10px;
        padding: 10px;
        border-bottom: 1px solid #ccc;
    }
    .fact b {
        flex-grow: 1;
        white-space: nowrap;
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