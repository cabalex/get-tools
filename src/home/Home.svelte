<script lang="ts">
    import { makeGETRequest, sharedDevices } from "../getStore";
    import { IconExclamationCircle } from "@tabler/icons-svelte";
    import Header from "./header/Header.svelte";
    import Insights from "./insights/Insights.svelte";
    import Scan from "./scan/Scan.svelte";
    import type { Account, Transaction } from "../types";

    async function loadAccounts(): Promise<Account[]> {
        let { response } = await makeGETRequest("commerce", "retrieveAccounts");
        return response.accounts;
    }


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
                    if (response.transactions[i].friendlyName === key) {
                        response.transactions[i].friendlyName = friendlyNames[key as never];
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
            <b>Sharing codes with {$sharedDevices.length} {$sharedDevices.length === 1 ? "device" : "devices"}</b>
            <span>See Scan &gt; Share Code for more details</span>
        </div>
    </div>
{/if}
{#await loadAccounts()}
    Loading...
{:then accounts}
    <Header accounts={accounts} />
{:catch error}
    <p>{error.message}</p>
{/await}
{#await loadTransactions()}
    Loading...
{:then transactions}
    <Insights transactions={transactions} />
{:catch error}
    <p>{error.message}</p>
{/await}

<Scan />

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
        width: 100%;
        z-index: 10;
    }
    .shareWarning .text {
        display: flex;
        flex-direction: column;
    }
    .shareWarning .text > * {
        margin: 0;
    }
    .shareWarning span {
        font-size: 0.8em;
    }
</style>