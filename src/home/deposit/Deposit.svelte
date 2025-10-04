<script lang="ts">
    import { IconCreditCard, IconAlertCircle, IconPigMoney, IconPlus, IconCurrencyDollar, IconRosetteDiscount, IconArrowRight } from "@tabler/icons-svelte";
    import { fade } from "svelte/transition";
    import { loadAccounts, makeGETRequest } from "../../getStore";
    import type { Account } from "../../types";
  import Loading from "../../assets/Loading.svelte";

    export let accounts: Account[];

    let depositAccepted = accounts.filter(x => x.depositAccepted);
    let paymentMethods = accounts.filter(x => x.accountType === 2);

    let amount = 14.70;
    let selectedAccount = depositAccepted.length ? depositAccepted[0].id : null;
    let selectedPaymentMethod = paymentMethods.length ? paymentMethods[0].id : null;

    let removingPaymentMethods = false;
    async function removePaymentMethods() {
        removingPaymentMethods = true;
        console.log("Removing payment methods");
        for (let account of paymentMethods) {
            console.log("Removing", account);
            const { response, exception } = await makeGETRequest("commerce", "deactivateAccount", {
                accountId: account.id
            });

            if (response) {
                console.log("Removed", account);
            } else {
                console.error("Failed to remove", account, exception);
            }
        }
        await loadAccounts();
        depositAccepted = accounts.filter(x => x.depositAccepted);
        paymentMethods = accounts.filter(x => x.accountType === 2);
        removingPaymentMethods = false;
    }

    let depositConfirmation: null|"confirm"|"success" = null;
    let paymentState: null|{state: "loading"|"error", error: string} = null;
    $: validDeposit = selectedAccount && selectedPaymentMethod && amount > 0;
    async function calculateFee() {
        if (!selectedAccount || !selectedPaymentMethod) return 0;

        let { response } = await makeGETRequest("commerce", "calculateDepositFee", {
            amount,
            fromAccountId: selectedPaymentMethod,
            toAccountId: selectedAccount
        });

        return response;
    }

    $: {
        if (depositConfirmation === null) {
            paymentState = null;
        }
    }

    async function pay(amt: number) {
        paymentState = {state: "loading", error: ""};

        let { response, exception } = await makeGETRequest("commerce", "deposit", {
            amount,
            fromAccountId: selectedPaymentMethod,
            toAccountId: selectedAccount,
            fromAccountCvv: null,
            amount: amt,
            cashlessTerminalLocation: null
        });

        if (response) {
            await loadAccounts();
            depositConfirmation = "success";
            paymentState = null;
        } else {
            paymentState = {state: "error", error: exception};
        }
    }
</script>

{#if depositAccepted.length && paymentMethods.length}
<div class="deposit">
    <div class="row">
        <span class="desktop"><IconPlus /></span>
        <h2 class="mobile">Deposit funds</h2>
        <div class="amountInput">
            <div class="amount">
                <IconCurrencyDollar />
                <input type="number" placeholder="Amount" step="any" bind:value={amount} />
            </div>
            to
            <select bind:value={selectedAccount}>
                {#each depositAccepted as account}
                    <option value={account.id}>{account.accountDisplayName}</option>
                {/each}
            </select>
            using
            <div class="amount" style="padding-right: 0">
            <IconCreditCard />
                <select bind:value={selectedPaymentMethod}>
                    {#each paymentMethods as account}
                        <option value={account.id}>
                            XXXX-{account.lastFour}
                        </option>
                    {/each}
                </select>
            </div>
        </div>
        <button disabled={!validDeposit} class="depositBtn" on:click={() => depositConfirmation = "confirm"}>
            Deposit
        </button>
    </div>
    <div class="notice">
        <IconAlertCircle />
        <span>You should remove all payment methods from your GET account before sharing your codes.</span>
        <button class="subtleBtn" disabled={removingPaymentMethods} on:click={removePaymentMethods}>
            {#if removingPaymentMethods}
                Removing...
            {:else}
                Do this now
            {/if}
        </button>
    </div>
</div>
{/if}

{#if depositConfirmation === "confirm"}
{@const targetAccount = depositAccepted.find(x => x.id === selectedAccount)}
{@const targetPaymentMethod = paymentMethods.find(x => x.id === selectedPaymentMethod)}
<!-- svelte-ignore a11y-no-static-element-interactions -->
<div class="shareModal" transition:fade={{duration: 100}} on:click={(e) => depositConfirmation = null}>
    <!-- svelte-ignore a11y-no-static-element-interactions -->
    <div class="shareModalInner" on:click={(e) => e.stopPropagation()}>
        <h2 style="margin: 0">Confirm Deposit</h2>
        <span>Payment details remain in GET and cannot be accessed by GET Tools.</span>
        <div class="fact">
            <IconCreditCard />
            <b>Paying with</b>
            XXXX-{targetPaymentMethod?.lastFour || `Payment method not found (${selectedPaymentMethod})`}
        </div>
        <div class="fact">
            <IconArrowRight />
            <b>Deposit to</b>
            {targetAccount?.accountDisplayName || `Account not found (${selectedAccount})`}
        </div>
        <div class="fact">
            <IconCurrencyDollar />
            <b />
            {amount.toFixed(2)}
        </div>
        {#await calculateFee()}
        <div class="fact">
            <IconRosetteDiscount />
            <b>Deposit fee</b>
            <Loading size="1.5em" />
        </div>
        {:then fee}
        <div class="fact">
            <IconRosetteDiscount />
            <b>Deposit fee</b>
            {fee.toFixed(2)}
        </div>
        <div class="fact">
            <IconCurrencyDollar />
            <b>Total</b>
            {(amount + fee).toFixed(2)}
        </div>
        {#if paymentState?.state === "error"}
        <div class="notice" style="color: red; padding: 10px 0">
            <IconAlertCircle />
            {paymentState.error}
        </div>
        {/if}
        <button class="payBtn" on:click={() => pay(amount)}>
            {#if paymentState?.state === "loading"}
                <Loading color="white" size="1.5em" />
            {:else}
                Pay ${(amount + fee).toFixed(2)}
            {/if}
        </button>
        <div class="notice" style="color: #444">
            <IconPigMoney /> You'll save ${((amount * 1.1) - (amount + fee)).toFixed(2)} on campus purchases.
        </div>
        {/await}
        
    </div>
</div>
{:else if depositConfirmation === "success"}
<!-- svelte-ignore a11y-no-static-element-interactions -->
<div class="shareModal" transition:fade={{duration: 100}} on:click={(e) => depositConfirmation = null}>
    <!-- svelte-ignore a11y-no-static-element-interactions -->
    <div class="shareModalInner" style="text-align: center" on:click={(e) => e.stopPropagation()}>
        <div class="successHeader">
            <IconCurrencyDollar size="5em" />
        </div>
        <h2 style="margin: 0">Deposit successful!</h2>
        <span>Your funds have been deposited to your account.</span>
        <button on:click={() => depositConfirmation = null} style="width: 100%; border-radius: 100px; justify-content: center; margin-top: 10px">
            Close
        </button>
    </div>
</div>
{/if}

<style>
    .notice {
        display: flex;
        gap: 10px;
        align-items: center;
        font-size: 0.9em;
        color: #ccc;
    }
    @media (prefers-color-scheme: light) {
        .notice {
            color: #222;
        }
    }
    .subtleBtn {
        border-radius: 100px;
        background-color: transparent;
        border-color: #555;
        color: white;
    }
    @media (prefers-color-scheme: light) {
        .subtleBtn {
            color: #222;
            border-color: #ccc;
        }
    }
    .subtleBtn:hover:not(:disabled) {
        border-color: white;
    }
    @media (prefers-color-scheme: light) {
        .subtleBtn:hover:not(:disabled) {
            border-color: #888;
        }
    }
    .mobile {
        display: none;
    }
    .deposit {
        padding: 20px;
        width: calc(100% - 40px);
        max-width: 1200px;
        margin: 0 auto;
        border-radius: 24px;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        gap: 10px;
    }
    .deposit h2 {
        margin: 0;
    }
    .row {
        border: 1px solid #ccc;
        padding: 10px 20px;
        border-radius: 100px;
        display: flex;
        gap: 10px;
        align-items: center;
        justify-content: center;
        flex-wrap: wrap;
    }
    .amountInput {
        background-color: #111;
        padding: 5px;
        border-radius: 100px;
        display: flex;
        align-items: center;
        width: fit-content;
        gap: 10px;
    }
    @media (prefers-color-scheme: light) {
        .amountInput {
            background-color: #ccc;
        }
    }
    .amountInput .amount {
        display: flex;
        align-items: center;
        gap: 5px;
        background-color: #222;
        border-radius: 100px;
        padding: 0 10px;
    }
    @media (prefers-color-scheme: light) {
        .amountInput .amount {
            background-color: #eee;
        }
    }
    .amountInput input {
        background-color: transparent;
        border: none;
        width: 10ch;
    }
    .amountInput select {
        background-color: #222;
        color: #eee;
        border: none;
        font-size: unset;
        border-radius: 100px;
        padding: 10px;
    }
    @media (prefers-color-scheme: light) {
        .amountInput select {
            background-color: #eee;
            color: black;
        }
    }
    .depositBtn {
        border-radius: 100px;
        padding: 10px 20px;
    }
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
        max-width: 700px;
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
    .payBtn {
        border-radius: 100px;
        padding: 10px 20px;
        color: white;
        margin-top: 10px;
        margin-left: auto;
    }
    .successHeader {
        display: flex;
        justify-content: center;
        align-items: center;
        gap: 10px;
        margin-bottom: 20px;
    }
    @media screen and (max-width: 900px) {
        .row {
            border: none;
            padding: 20px 0;
        }
    }
    @media screen and (max-width: 700px) {
        .row {
            border: 1px solid #ccc;
            padding: 20px;
            flex-direction: column;
            align-items: stretch;
            text-align: center;
            width: calc(100% - 40px);
            border-radius: 24px;
        }
        .mobile {
            display: block;
        }
        .desktop {
            display: none;
        }
        .row > .amountInput {
            width: calc(100% - 10px);
        }
        .depositBtn {
            justify-content: center;
        }
        .amountInput {
            flex-direction: column;
            align-items: stretch;
            text-align: center;
            border-radius: 22px;
            flex-grow: 1;
        }
        .subtleBtn {
            white-space: nowrap;
        }
        select {
            width: 100%;
        }
    }
</style>