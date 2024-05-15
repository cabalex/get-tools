<script lang="ts">
    import { makeGETRequest, sharedDevices, logout } from "../getStore";
    import { IconExclamationCircle } from "@tabler/icons-svelte";
    import Header from "./header/Header.svelte";
    import Insights from "./insights/Insights.svelte";
    import Scan from "./scan/Scan.svelte";
    import type { Account, Transaction } from "../types";
    import Skeleton from "../assets/Skeleton.svelte";

    async function loadAccounts(): Promise<Account[]> {
        let { response } = await makeGETRequest("commerce", "retrieveAccounts");
        return response.accounts;
    }

    let shareModalOpen = false;


    const friendlyNames = {
        "Simp-Oakes": "Oakes Cafe",
        "Simp-RCHDH": "Rachel Carson/Oakes Dining Hall",
        "Simp-PorterMarket": "Porter Market",
        "Simp-Porter": "Porter/Kresge Dining Hall",
        "Simp-CollegeNine": "College 9/10 Dining Hall",
        "Simp-Merrill": "Crown/Merrill Dining Hall",
        "Simp-MerrillMarket": "Merrill Market",
        "Simp-Cowell": "Cowell/Stevenson Dining Hall",
        "Simp-GlobalVillage": "Global Village Cafe",
        "Simp-PerkEMS": "Perk Coffee Bar (Earth & Marine Sciences)",
        "Simp-PerkBaskin": "Perk Coffee Bar (Baskin Engineering)",
        "Simp-PerkPSB": "Perk Coffee Bar (Physical Sciences Building)",
        "Simp-Stevenson Coffee Shop": "Stevenson Coffee Shop",
        "Simp-UnivCenter": "University Center",
        "Simp-SlugStop": "Slug Stop",
        "Simp-Perk": "Perk Coffee Bar",
    }
    
    async function loadTransactions(): Promise<Transaction[]> {
        let startOfTerm = new Date()
        startOfTerm.setMonth(startOfTerm.getMonth() - 3)
        
        let { response } = await makeGETRequest("commerce", "retrieveTransactionHistoryWithinDateRange", {
            "paymentSystemType": 0,
            "queryCriteria": {
                "maxReturnMostRecent": 1000,
                "newestDate": null,
                "oldestDate": startOfTerm.toISOString(),
                "accountId": null
            }
        });

        if (response.transactions) {
            for (let i = 0; i < response.transactions.length; i++) {
                if (response.transactions[i].locationId === "9001") { // Server Console
                    return response.transactions.slice(0, i);
                }
                
                // probably a faster way of doing this
                response.transactions[i].friendlyName = response.transactions[i].locationName.slice(0, -2);
                for (let key of Object.keys(friendlyNames)) {
                    if (response.transactions[i].friendlyName.startsWith(key)) {
                        response.transactions[i].friendlyName = friendlyNames[key as never];
                        break;
                    }
                }
            }
        }

        return response.transactions;
    }
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
{#await loadAccounts()}
    <Skeleton height={300} />
{:then accounts}
    <Header accounts={accounts} />
{:catch error}
    <p>{error.message}</p>
{/await}
{#await loadTransactions()}
    <Skeleton height={500} />
{:then transactions}
    <Insights transactions={transactions} />
    <div class="logout">
        <button
            class="dangerBtn logoutBtn"
            disabled={$sharedDevices && $sharedDevices.length}
            on:click={logout}
        >
            {$sharedDevices && $sharedDevices.length ? "Revoke all codes before logging out" : "Logout"}
        </button>
    </div>
{:catch error}
    <p>{error.message}</p>
{/await}

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