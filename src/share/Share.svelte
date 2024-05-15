<script lang="ts">
    import { IconBarcode, IconBarcodeOff, IconCheck, IconUser, IconChevronLeft } from "@tabler/icons-svelte";
    import { makeGETRequest } from "../getStore";
    import { onDestroy, onMount } from "svelte";
    import * as PDF417 from "pdf417-generator";
    import './ShareFullscreen.css';
    import Loading from "../assets/Loading.svelte";

    let canvasElem: HTMLCanvasElement;
    let interval: number;
    let invalid = false;
    let sessionId: string = "";
    let lightTheme = false;

    let pin = "";
    let deviceId = "";
    async function getSessionId() {
        let params = new URLSearchParams(location.search);
        try {
            let shareParams = JSON.parse(atob(params.get("share") || ""));
            pin = shareParams.pin;
            deviceId = shareParams.deviceId;
        } catch {
            console.error("Invalid share code.");
            invalid = true;
            return false;
        }
        if (!pin || !deviceId){
            console.error("No pin or deviceId found in URL.");
            invalid = true;
            return false;
        }
        
        let response = await makeGETRequest("authentication", "authenticatePIN", {
            pin,
            deviceId,
            systemCredentials: {
                password: "NOTUSED",
                userName: "get_mobile",
                domain: ""
            }
        }, false);

        if (response.exception) {
            console.error(response.exception);
            invalid = true;
            return false;
        }
        sessionId = response.response;
        return true;
    }

    async function revokeCode() {
        let response = await makeGETRequest("user", "deletePIN", {
            sessionId,
            deviceId
        }, false);

        if (response.response === true) {
            invalid = true;
        } else {
            alert("Failed to revoke code. Please try again.")
        }
    }

    let generated = false;
    async function generateCode() {
        if (await getSessionId() === false) return;

        let { response } = await makeGETRequest("authentication", "retrievePatronBarcodePayload", {sessionId}, false);
        PDF417.draw(response, canvasElem, 3);
        generated = true;
    }

    onMount(async () => {
        await generateCode();
        setInterval(generateCode, 10000);
    })

    onDestroy(() => {
        clearInterval(interval);
    });

    $: {
        if (lightTheme) {
            document.body.classList.add("light");
        } else {
            document.body.classList.remove("light");
        }
    }
</script>
{#if lightTheme}
<header class="shareOuterHeader">
    <button on:click={() => lightTheme = false}><IconChevronLeft /> Back</button>
    <h2>Scan Card</h2>
</header>
{/if}
<section class="shareClient" class:light={lightTheme}>
    {#if !invalid}
        <div class="shareHeader">
            {#if lightTheme}
            <div style="flex-grow: 1; height: 100%" />
            <IconUser size={128} />
            <div style="flex-grow: 1; height: 100%" />
            {:else}
            <IconBarcode size={256} />
            <h3>Scan below</h3>
            <p>For best results, increase your device's brightness before scanning</p>
            <button class="lightMode" on:click={() => lightTheme = true}>
                Switch theme
            </button>
            <p class="credit">Shared via <a style="color: white" href="https://cabalex.github.io/get-tools">GET Tools</a></p>
            {/if}
        </div>
        <div class="barcode">
            {#if !generated}
                <div class="loading">
                    <Loading />
                </div>
            {/if}
            <canvas bind:this={canvasElem} />
        </div>
        <button class="dangerBtn" on:click={revokeCode}>I'm done with this code</button>
    {:else}
        <div class="shareHeader">
            <IconBarcodeOff size={256} />
            <h2>Code revoked</h2>
            <h3>Ask the account owner for a new one!</h3>
            <p class="credit">Share your points with <a style="color: white" href="https://cabalex.github.io/get-tools">GET Tools</a></p>
        </div>
    {/if}
</section>