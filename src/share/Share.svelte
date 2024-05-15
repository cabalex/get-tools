<script lang="ts">
    import { IconBarcode, IconBarcodeOff } from "@tabler/icons-svelte";
    import { makeGETRequest } from "../getStore";
    import { onDestroy, onMount } from "svelte";
    import * as PDF417 from "pdf417-generator";
    import Loading from "../assets/Loading.svelte";

    let canvasElem: HTMLCanvasElement;
    let interval: number;
    let invalid = false;
    let sessionId: string = "";

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
</script>

<section class="shareClient">
    {#if !invalid}
        <div class="shareHeader">
            <IconBarcode size={256} />
            <h3>Scan below</h3>
            <p>For best results, increase your device's brightness before scanning</p>
            <p class="credit">Shared via <a style="color: white" href="https://cabalex.github.io/get-tools">GET Tools</a></p>
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

<style>
    .shareClient {
        position: fixed;
        width: calc(100% - 40px);
        height: calc(100% - 40px);
        height: calc(calc(100% - 40px) - env(safe-area-inset-bottom));
        display: flex;
        flex-direction: column;
        gap: 20px;
        padding: 10px;
        margin: 10px;
        border-radius: 10px;
        background-color: #444;
    }
    .shareHeader {
        height: calc(100% - 40px);
        background-color: #555;
        border-radius: 10px;
        padding: 40px;
        display: flex;
        text-align: center;
        justify-content: center;
        align-items: center;
        flex-direction: column;
        position: relative;
    }
    h2 {
        margin: 0;
        line-height: 64px;
        font-size: 48px;
    }
    h3 {
        margin: 0;
    }
    .credit {
        position: absolute;
        bottom: 10px;
        font-size: 0.9em;
    }
    .barcode {
        border-radius: 10px;
        padding: 10px 2%;
        height: 150px;
        background-color: white;
        display: flex;
        justify-content: center;
        align-items: center;
        overflow: hidden;
    }
    .barcode canvas {
        width: calc(100% - 40px);
        max-width: 700px;
        height: 100%;
        image-rendering: pixelated;
        image-rendering: crisp-edges;
    }
    .dangerBtn {
        justify-content: center;
        padding: 20px;
        height: 10%;
    }
    .loading {
        position: absolute;
        width: 100%;
        height: 100%;
    }
    @media screen and (min-width: 700px) {
        .barcode {
            height: 150px;
        }
    }
</style>