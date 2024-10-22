<script lang="ts">
    import { onMount } from "svelte";
    import { sharedDevices, logout, accounts, transactions, loadAccounts, loadTransactions } from "../getStore";
    import { IconExclamationCircle } from "@tabler/icons-svelte";
    import Header from "./header/Header.svelte";
    import Deposit from "./deposit/Deposit.svelte";
    import Insights from "./insights/Insights.svelte";
    import Scan from "./scan/Scan.svelte";
    import Skeleton from "../assets/Skeleton.svelte";

    let shareModalOpen = false;

    onMount(() => {
        loadAccounts();
        loadTransactions();
    });
</script>
{#if $sharedDevices && $sharedDevices.length > 0}
    <div class="shareWarning">
        <IconExclamationCircle />
        <div class="text">
            <b>Sharing {$sharedDevices.length} {$sharedDevices.length === 1 ? "code" : "codes"}</b>
            <span>Other people can use your GET account to pay</span>
        </div>
        <button on:click={() => shareModalOpen = true}>
            View and disable
        </button>
    </div>
{/if}
{#if $accounts === null}
    <Skeleton height={300} />
    <Skeleton height={100} />
{:else}
    <Header accounts={$accounts} />
    <Deposit accounts={$accounts} />
{/if}
{#if $transactions === null}
    <Skeleton height={500} />
{:else}
    <Insights transactions={$transactions} />
    <div class="logout">
        <button
            class="dangerBtn logoutBtn"
            disabled={$sharedDevices && $sharedDevices.length}
            on:click={logout}
        >
            {$sharedDevices && $sharedDevices.length ? "Revoke all codes before logging out" : "Logout"}
        </button>
    </div>
{/if}

<Scan bind:shareModalOpen={shareModalOpen} />

<style>
    .shareWarning {
        background-color: orange;
        color: black;
        display: flex;
        align-items: center;
        gap: 10px;
        padding: 10px;
        position: fixed;
        top: 0;
        left: 0;
        width: calc(100% - 20px);
        z-index: 10;
    }
    .shareWarning .text {
        display: flex;
        flex-direction: column;
        flex-grow: 1;
    }
    .shareWarning .text > * {
        margin: 0;
    }
    .shareWarning span {
        font-size: 0.8em;
    }
    .shareWarning button {
        white-space: nowrap;
        background-color: transparent;
        border-color: black;
        color: black;
        transition: background-color 0.2s, color 0.2s;
    }
    .shareWarning button:hover {
        background-color: black;
        color: white;
    }
    .logout {
        background-color: #111;
        margin: 0 auto;
        padding: 20px;
        padding-bottom: 100px;

        display: flex;
        justify-content: center;
        align-items: center;
    }
    .logoutBtn {
        padding: 10px 40px;
    }
</style>