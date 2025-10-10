<script lang="ts">
    import { IconToolsKitchen2, IconShoppingCart, IconArrowRight, IconBuildingStore, IconCoffee, IconCreditCard, IconCreditCardPay, IconCreditCardRefund } from "@tabler/icons-svelte";
    import type { Transaction } from "../../types";
    import Charts from "./Charts.svelte";
    import { slide } from "svelte/transition";
    import type { Account } from "../../types";

    export let transactions: Transaction[];
    export let accounts: Account[];
</script>

<section class="insights">
    <h1>SPENDING INSIGHTS</h1>
    <Charts accounts={accounts} transactions={transactions} />
</section>
<section class="transactions">
    <h2>Transactions</h2>
    {#each transactions as transaction, i}
        {#if i === 0 || new Date(transaction.actualDate).toLocaleDateString() !== new Date(transactions[i - 1].actualDate).toLocaleDateString()}
            <h1>{new Date(transaction.actualDate).toLocaleDateString()}</h1>
        {/if}
        <div class="transaction" class:deposit={transaction.transactionType === 3} transition:slide={{duration: 100}}>
            {#if transaction.friendlyName.includes("Dining Hall")}
            <IconToolsKitchen2 />
            {:else if transaction.friendlyName.includes("Market")}
            <IconShoppingCart />
            {:else if transaction.friendlyName.includes("Coffee")}
            <IconCoffee />
            {:else if transaction.locationName.includes("Deposit")}
            <IconCreditCardPay />
            {:else if transaction.locationName === "GET"}
            <IconCreditCardRefund />
            {:else}
            <IconBuildingStore />
            {/if}
            <h3>{transaction.friendlyName}</h3>
            <div class="amount">
                <span>$<p>{transaction.amount.toFixed(2)}</p></span>
                {#if typeof transaction.resultingBalance === "number"}
                    <span class="dollars">
                        <IconArrowRight size={16} />
                        ${transaction.resultingBalance.toFixed(2)}
                    </span>
                {:else if transaction.accountType === 2}
                    <span class="dollars">
                        <IconCreditCard size={16} />
                        {transaction.accountName}
                    </span>
                {/if}
            </div>
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
    @media (prefers-color-scheme: light) {
        .transaction {
            background-color: #ccc;
            color: black;
        }
    }
    .transaction.deposit {
        background-color: #1a1a1a;
    }
    @media (prefers-color-scheme: light) {
        .transaction.deposit {
            background-color: #e6e6e9;
        }
    }
    .transaction.deposit p {
        color: #93c02d;
    }
    @media (prefers-color-scheme: light) {
        .transaction.deposit p {
            color: #587d02;
        }
    }
    .transaction.deposit span:first-child:before {
        content: "+";
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
        line-height: 1em;
        margin: 0;
    }
    .amount {
        display: flex;
        flex-direction: column;
        align-items: flex-end;
    }
    .amount > span {
        display: flex;
        gap: 5px;
        align-items: center;
    }
    .dollars {
        color: #ccc;
    }
    @media (prefers-color-scheme: light) {
        .dollars {
            color: #555;
        }
    }
</style>