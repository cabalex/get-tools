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
        let pin = Math.floor(Math.random() * 9999).toString().padStart(4, "0");


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

    let step = 0;
</script>

<div class="onboarding">
    {#if loading}
        <p><b>GET</b>ting your data...</p>
        <Loading />
    {:else}
        <h2 style="margin-bottom: 20px">Welcome to GET Tools!</h2>
        <div class="step" class:complete={step >= 1}>
            <span class="step-number">1</span>
            <p>Before we begin, please read how your data is handled.</p>
            <a class="btn" href="https://github.com/cabalex/get-tools?tab=readme-ov-file#security" target="_blank" rel="noopener noreferrer" on:click={() => step = 1}>
                No, seriously. Read it. <IconExternalLink />
            </a>
            <span class="small">This is <b>sensitive data</b> that pertains to <b>your stuff</b>! You should always be curious about how it's processed.</span>
            <span class="small">By continuing, you agree to the terms listed in the link above.</span>
        </div>
        <div class="step" class:complete={step >= 2} class:hidden={step < 1}>
            <span class="step-number">2</span>
            <p>Next, we'll need access to your GET account.</p>
            <p>Open this link and sign in with your UCSC account.</p>
            <a class="btn" href="https://get.cbord.com/ucsc/full/login.php?mobileapp=1" target="_blank" rel="noopener noreferrer" on:click={() => step = 2}>
                Log in with UCSC <IconExternalLink />
            </a>
        </div>
        <div class="step" class:complete={step >= 3} class:hidden={step < 2} style="border-left-color: transparent;">
            <span class="step-number">3</span>
            <p>Once you arrive at a page that says "validated",<br /> copy the page link and paste it here.</p>
            <div class="linkInput">
                <IconLink />
                <input type="text" bind:value={linkValue} />
                {#if invalidLink}
                    <span style="color: red;">Hmm... this doesn't seem like a valid link. Try again?</span>
                {/if}
            </div>
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
        border-radius: 0 0 10px 10px;
        color: #222;

        display: flex;
        flex-direction: column;
        align-items: center;
        max-width: 500px;
        margin: auto;
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
        width: 32ch;
        max-width: calc(100vw - 150px);
    }
    .small {
        color: #555;
    }
    h2, p {
        margin: 0;
    }
    .step {
        width: calc(100% - 30px);
        border-left: 2px solid #ccc;
        padding: 10px;
        padding-left: 30px;
        padding-top: 0;
        padding-bottom: 30px;
        margin-left: 10px;
        position: relative;
        text-align: left;
        
        display: flex;
        flex-direction: column;
        align-items: flex-start;
        justify-content: center;
        gap: 10px;
        transition: opacity 0.3s, border-color 0.3s;
    }
    .step.hidden {
        opacity: 0.5;
        pointer-events: none;
    }
    .step:not(.hidden):not(.complete) .step-number {
        background-color: #222;
        color: #eee;
    }
    .step.hidden .btn {
        background-color: #ccc;
    }
    .step .step-number {
        position: absolute;
        left: -1px;
        transform: translateX(-50%);
        background-color: #ccc;
        width: 24px;
        height: 24px;
        border-radius: 50%;
        top: 0;
        font-weight: bold;
        color: #555;
        text-align: center;
        transition: background-color 0.3s, color 0.3s;
    }
    .step.complete {
        border-color: green;
    }
    .step.complete .step-number {
        background-color: green;
        color: #fff;
    }
</style>