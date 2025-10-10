<script lang="ts">
    import { onMount } from "svelte";
    import { sharedDevices, logout, accounts, transactions, loadAccounts, loadTransactions } from "../getStore";
    import { IconExclamationCircle, IconPlus, IconAlertCircle, IconScan, IconTrash } from "@tabler/icons-svelte";
    import Header from "./header/Header.svelte";
    import Deposit from "./deposit/Deposit.svelte";
    import Insights from "./insights/Insights.svelte";
    import Scan from "./scan/Scan.svelte";
    import Skeleton from "../assets/Skeleton.svelte";
  import { fade } from "svelte/transition";
    import { writable } from "svelte/store";

    let shareModalOpen = false;

    onMount(() => {
        loadAccounts();
        loadTransactions();
    });

    let savedCodes: string[] = JSON.parse(localStorage.getItem("get-savedCodes") || "[]");
    let addCodeModalOpen = false;
    let addCodeValue = "";
    let addCodeError = "";

    function saveCode(): string {
        if (!addCodeValue) return;

        if (addCodeValue.startsWith(document.location.origin)) {
            let code = addCodeValue.split("?")[1].split("=")[1];
            savedCodes = [...savedCodes, code];
            localStorage.setItem("get-savedCodes", JSON.stringify(savedCodes));
            addCodeModalOpen = false;
            addCodeError = "";
            addCodeValue = "";
        } else {
            addCodeError = "Invalid URL";
            return "";
        }
    }

    function deleteCode(i: number) {
        if (confirm("Are you sure you want to delete this code? This can't be undone.")) {
            savedCodes = savedCodes.filter((_, index) => index !== i);
            localStorage.setItem("get-savedCodes", JSON.stringify(savedCodes));
        }
    }
    
    let currentTheme: 'dark' | 'light' = 'light'; // Default to light

    onMount(() => {
        // Check for the 'prefers-color-scheme: dark' media query
        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

        // Set the initial theme based on the media query
        currentTheme = mediaQuery.matches ? 'dark' : 'light';

        // Listen for changes to the media query
        const handleChange = (event: MediaQueryListEvent) => {
            currentTheme = event.matches ? 'dark' : 'light';
        };

        mediaQuery.addEventListener('change', handleChange);

        // Clean up the event listener when the component is unmounted
        return () => {
            mediaQuery.removeEventListener('change', handleChange);
        };
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
<div class="savedCodes">
    <h2>Saved codes</h2>
    <div class="codes">
        {#each savedCodes as savedCode, i}
            <a class="code" href={document.location.origin + document.location.pathname + `?share=${savedCode}`}>
                <button class="dangerBtn" on:click={(e) => { e.stopPropagation(); e.preventDefault(); deleteCode(i) }}>
                    <IconTrash />
                </button>
                <IconScan size={48} />
                <p>{savedCode}</p>
            </a>
        {/each}
        <button class="code addCode" on:click={() => addCodeModalOpen = true}>
            <IconPlus size={48} />
        </button>
    </div>
</div>
{#if $transactions === null || $accounts === null}
    <Skeleton height={500} />
{:else}
    {#key currentTheme}
        <Insights accounts={$accounts} transactions={$transactions} />
    {/key}
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

{#if addCodeModalOpen}
<!-- svelte-ignore a11y-no-static-element-interactions -->
<div class="shareModal" transition:fade={{duration: 100}} on:click={() => addCodeModalOpen = false}>
    <!-- svelte-ignore a11y-no-static-element-interactions -->
    <div class="shareModalInner" on:click={(e) => e.stopPropagation()}>
            <h2 style="margin-bottom: 0">Save a shared code</h2>
            <p style="margin-top: 0">This won't prevent the code from being revoked. You'll have to delete it manually if it stops working.</p>
            <div style="display: flex; gap: 10px; align-items: center">
                <input on:change={saveCode} bind:value={addCodeValue} style="width: calc(100% - 40px)" type="text" placeholder={location.origin + location.pathname + "?share=..."} />
                <button on:click={saveCode}>
                    <IconPlus />
                </button>
            </div>
            {#if addCodeError}
                <div class="notice" style="color: red; padding: 10px 0">
                    <IconAlertCircle />
                    {addCodeError}
                </div>
            {/if}
        </div>
    </div>
{/if}

<style>
    .shareModal {
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
    .shareModalInner {
        background-color: white;
        color: black;   
        padding: 20px;
        border-radius: 10px;
        box-shadow: 0 0 10px rgba(0, 0, 0, 0.5);
        max-width: min(100%, 700px);
        position: relative;
    }
    .notice {
        display: flex;
        gap: 10px;
        align-items: center;
        color: #ccc;
        font-size: 0.9em;
    }
    .codes {
        display: flex;
        overflow-y: auto;
        gap: 10px;
    }
    .code {
        width: 200px;
        height: 100px;
        position: relative;
        flex-shrink: 0;
        color: white;
        background-color: #333;
        border-radius: 5px;
        border: 1px solid #aaa;
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        transition: all 0.2s;
    }
    @media (prefers-color-scheme: light) {
        .code {
            color: black;
        }
    }
    .code:hover {
        background-color: #444;
        border-color: #eee;
    }
    @media (prefers-color-scheme: light) {
        .code:hover {
            color: white;
        }
    }
    .code .dangerBtn {
        border-radius: 0 5px 0 0;
        position: absolute;
        top: 0;
        right: 0;
        padding: 5px;
        background-color: #222;
        transition: all 0.2s;
    }
    .code .dangerBtn:hover {
        background-color: var(--danger);
    }
    .code p {
        margin: 0;
        font-size: 2em;
        font-family: monospace;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        width: 90%;
        color: #999;
    }
    .addCode {
        background-color: transparent;
        border: 1px solid #aaa;
    }
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
    .savedCodes {
        margin: 0 auto;
        max-width: 1200px;
        padding: 20px;
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
    @media (prefers-color-scheme: light) {
        .logout {
            background-color: #ccc;
        }
    }
    .logoutBtn {
        padding: 10px 40px;
    }
</style>