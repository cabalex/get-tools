<script lang="ts">
    import { IconToolsKitchen2, IconShoppingCart, IconBuildingStore, IconCoffee } from "@tabler/icons-svelte";
    import type { Transaction } from "../../types";
    import Charts from "./Charts.svelte";
    import 'chartjs-adapter-date-fns';

    export let transactions: Transaction[];
</script>

<section class="insights">
    <h1>SPENDING INSIGHTS</h1>
    <Charts transactions={transactions} />
</section>
<section class="transactions">
    <h2>Transactions</h2>
    {#each transactions as transaction, i}
        {#if i === 0 || transaction.actualDate.slice(0, 10) !== transactions[i - 1].actualDate.slice(0, 10)}
            <h1>{transaction.actualDate.slice(0, 10)}</h1>
        {/if}
        <div class="transaction">
            {#if transaction.friendlyName.includes("Dining Hall")}
            <IconToolsKitchen2 />
            {:else if transaction.friendlyName.includes("Market")}
            <IconShoppingCart />
            {:else if transaction.friendlyName.includes("Coffee Bar")}
            <IconCoffee />
            {:else}
            <IconBuildingStore />
            {/if}
            <h3>{transaction.friendlyName}</h3>
            $<p>{transaction.amount}</p>
        </div>
    {/each}
</section>

<style>
    h1 {
        font-size: 18px;
        margin: 0;
    }
    .transactions h1:not(:first-child) {
        margin-top: 2em;
    }
    .insights, .transactions {
        padding: 20px;
        max-width: 1200px;
        margin: 0 auto;
    }
    .transaction {
        display: flex;
        gap: 10px;
        align-items: center;
        padding: 10px;
        background-color: #111;
        color: #eee;
        border-radius: 10px;
        margin-top: 10px;
    }
    .transaction h3 {
        flex-grow: 1;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        margin: 0;
    }
    .transaction p {
        font-weight: bold;
        font-size: 36px;
        margin: 0;
    }
</style>