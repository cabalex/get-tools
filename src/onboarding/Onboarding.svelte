<script lang="ts">
    import { IconExternalLink, IconLink } from "@tabler/icons-svelte";
    import Loading from "../assets/Loading.svelte";
    import sessionId, { makeGETRequest } from "../getStore";
    let linkValue = "";
    let invalidLink = false;
    let loading = false;

    async function validateGET(sessionId: string) {
        loading = true;

        let deviceId = Math.round(Math.random() * 100_000_000_000_000_000).toString(16).padStart(16, "9");
        let pin = Math.floor(Math.random() * 1000).toString().padStart(4, "0");


        let response = await makeGETRequest("user", "createPIN", {
            sessionId,
            deviceId,
            PIN: pin
        }, false);

        if (response.response === true) {
            localStorage.setItem("get-data", JSON.stringify({
                deviceId,
                pin
            }));
            $sessionId = sessionId;
        } else {
            invalidLink = true;
            loading = false;
        }
    }

    $: {
        if (linkValue.length >= 32) {
            let match = linkValue.match(/([0-9A-Fa-f]{8}-[0-9A-Fa-f]{4}-[0-9A-Fa-f]{4}-[0-9A-Fa-f]{4}-[0-9A-Fa-f]{12})/gm);
            if (match) {
                validateGET(match[0]);
            } else {
                invalidLink = true;
            }
        }
    }
</script>

<div class="onboarding">
    {#if loading}
        <p><b>GET</b>ting your data...</p>
        <Loading />
    {:else}
        <h2>Welcome to GET Tools!</h2>
        <p>To get started, we'll need access to your GET account.</p>
        <p>Open this link and sign in with your UCSC account.</p>
        <a class="btn" href="https://get.cbord.com/ucsc/full/login.php?mobileapp=1" target="_blank" rel="noopener noreferrer">
            Log in with UCSC <IconExternalLink />
        </a>
        <p>Once you arrive at a page that says "activated",<br /> copy the page link and paste it here.</p>
        <div class="linkInput">
            <IconLink />
            <input type="text" bind:value={linkValue} style="width: 32ch" />
            {#if invalidLink}
                <span style="color: red;">Hmm... this doesn't seem like a valid link. Try again?</span>
            {/if}
        </div>
        <span class="small">
            Your login data is only sent to GET and remains on device.<br /><a target="_blank" rel="noopener noreferrer" href="https://github.com/cabalex/get-tools?tab=readme-ov-file#security">See how we process your data</a>
        </span>
    {/if}
</div>

<style>
    .onboarding {
        background-color: #eee;
        padding: 20px;
        border-radius: 10px;
        color: #222;

        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 10px;
        max-width: 500px;
        margin: 20px auto;
        text-align: center;
    }
    .linkInput {
        background-color: #222;
        color: #eee;
        display: flex;
        align-items: center;
        gap: 10px;
        padding: 5px;
        padding-left: 10px;
        border-radius: 10px;
    }
    .linkInput input {
        background-color: #111;
        color: #eee;
        font-size: 1em;
        width: 100%;
    }
    .small {
        color: #555;
    }
    h2, p {
        margin: 0;
    }
</style>