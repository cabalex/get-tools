<script lang="ts">
    import { IconClock } from "@tabler/icons-svelte";
    import { revokeOptions } from "../../../getStore";
    import { slide } from "svelte/transition";

    let revokeAfter: "off"|"balance"|"transactions" = $revokeOptions ? $revokeOptions.condition : "off";
    let transactionsAmount = $revokeOptions && $revokeOptions.condition === "transactions" ? $revokeOptions.value : 1;
    let balanceAmount = $revokeOptions && $revokeOptions.condition === "balance" ? $revokeOptions.value : 20;

    $: {
        if (revokeAfter === "transactions") {
            $revokeOptions = { condition: revokeAfter, value: transactionsAmount, startTime: Date.now() };
        } else if (revokeAfter === "balance") {
            $revokeOptions = { condition: revokeAfter, value: balanceAmount, startTime: Date.now() };
        } else {
            $revokeOptions = null;
        }
        localStorage.setItem("revoke-options", JSON.stringify($revokeOptions));
    }
</script>

<div class="revokeOptions">
    <div class="revokeSettings">
        <IconClock />
        <span>Revoke codes</span>
        <select bind:value={revokeAfter}>
            <option value="off">manually</option>
            <option value="transactions">after # transactions</option>
            <option value="balance">when balance drops below</option>
        </select>
        {#if revokeAfter === "transactions"}
            <input bind:value={transactionsAmount} type="number" min="1" />
        {:else if revokeAfter === "balance"}
            $<input bind:value={balanceAmount} type="number" min="0" />
        {/if}
    </div>
    {#if revokeAfter !== "off"}
    <div class="warning" transition:slide={{duration: 100}}>Tracking {revokeAfter}. Keep this page open!</div>
    {/if}
</div>

<style>
    .revokeOptions {
        display: flex;
        flex-direction: column;
        gap: 10px;
        border: 1px solid #aaa;
        padding: 10px;
        border-radius: 10px;
    }
    .revokeSettings {
        display: flex;
        gap: 10px;
        align-items: center;
        font-weight: bold;
    }
    select, input {
        padding: 5px;
        border-radius: 5px;
        border: none;
        background-color: #efefef;
        color: black;
        font-weight: bold;
    }
    input {
        width: 7ch;
    }
    .warning {
        color: red;
        font-weight: bold;
        animation: breathe 3s infinite;
    }
    @keyframes breathe {
        0% { opacity: 0.5; }
        50% { opacity: 1; }
        100% { opacity: 0.5; }
    }
</style>