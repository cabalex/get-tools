<script lang="ts">
    import type { Account } from "../../types";

    export let accounts: Account[];

    $: money = accounts.reduce((acc, account) => acc + (account.balance || 0), 0);
</script>

<header>
    <div class="headerText">
        <h3>WELCOME BACK</h3>
        <h1>You've got <span style="color: var(--secondary)">${money.toFixed(2)}</span>.</h1>
        <div class="accounts">
            {#each accounts.filter(x => x.accountType === 3) as account}
                <div class="account">
                    <h2>{account.accountDisplayName}</h2>
                    <p><span class="small">$</span>{(account.balance || 0).toFixed(2)}</p>
                </div>
            {/each}
        </div>
    </div>
</header>

<style>
    header {
        width: calc(100% - 40px);
        padding: 20px;
        padding-top: 100px;
        background: linear-gradient(to bottom, rgba(0, 0, 0, 0), #242424), url(https://cabalex.github.io/get-tools/banner.jpg), var(--primary);
        background-size: cover;
        background-position-y: 40%;
    }
    @media (prefers-color-scheme: light) {
        header {
            background: linear-gradient(to bottom, rgba(0, 0, 0, 0), #fff 60%), url(https://cabalex.github.io/get-tools/banner.jpg), var(--primary);
            background-size: cover;
            background-position-y: 40%; 
        }
    }
    .headerText {
        color: #eee;
        max-width: 1200px;
        margin: 0 auto;
    }
    @media (prefers-color-scheme: light) {
        .headerText {
            color: #222;
        }
    }
    .accounts {
        display: flex;
        gap: 20px;
    }
    .account {
        background-color: #eee;
        color: #111;
        padding: 10px;
        border-radius: 10px;
        width: 100px;
    }
    @media (prefers-color-scheme: light) {
        .account {
            background-color: #111;   
            color: #eee;
        }
    }
    .account .small {
        color: #555;
    }
    @media (prefers-color-scheme: light) {
        .account .small {
            color: #bbb;
        }
    }
    .account h2 {
        margin: 0;
        font-size: 0.75em;
    }
    .account p {
        margin: 0;
        font-size: 1.5em;
        font-weight: bold;
    }
    h1, h3 {
        margin: 0;
    }
    h1 {
        margin-bottom: 20px;
        filter: drop-shadow(0 0 10px rgba(0, 0, 0, 0.5));
    }
    @media (prefers-color-scheme: light) {
        h1 {
            filter: drop-shadow(0 0 10px rgba(255, 255, 255, 0.5));
        }
    }
    h1 {
        font-weight: normal;
    }
    h1 span {
        font-weight: bold;
    }
</style>