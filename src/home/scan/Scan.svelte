<script lang="ts">
    import { IconScan, IconChevronUp, IconChevronDown, IconShare, IconArrowsMaximize } from "@tabler/icons-svelte";
    import { makeGETRequest } from "../../getStore";
    import { onDestroy, onMount } from "svelte";
    import Share from "./share/Share.svelte";
    import ScanFullscreen from "./ScanFullscreen.svelte";
    import * as PDF417 from "pdf417-generator";

    let tabOpen = false;
    let canvasElem: HTMLCanvasElement;
    let interval: number;
    export let shareModalOpen = false;
    export let scanFullscreenOpen = false;

    let code = "";
    async function generateCode() {
        let { response } = await makeGETRequest("authentication", "retrievePatronBarcodePayload");
        code = response;
        PDF417.draw(response, canvasElem, 3);
    }

    onMount(() => {
        generateCode();
    })

    onDestroy(() => {
        clearInterval(interval);
    });

    $: {
        if (tabOpen) {
            generateCode();
            interval = setInterval(() => {
                generateCode();
            }, 5000);
        } else {
            clearInterval(interval);
        }
    }
</script>

<div class="scan" class:open={tabOpen}>
    <button class="scanPullTab" on:click={() => tabOpen = !tabOpen}>
        <IconScan />
        <span style="flex-grow: 1">SCAN</span>
        {#if tabOpen}
            <IconChevronDown />
        {:else}
            <IconChevronUp />
        {/if}
    </button>
    <div class="barcode">
        <canvas bind:this={canvasElem} />
    </div>
    <div class="btnrow">
        <button on:click={() => shareModalOpen = true}>
            <IconShare /> Share Code
        </button>
        <button on:click={() => scanFullscreenOpen = true}>
            <IconArrowsMaximize /> Maximize
        </button>
    </div>
</div>
{#if shareModalOpen}
    <Share on:close={() => shareModalOpen = false} />
{/if}
{#if scanFullscreenOpen}
    <ScanFullscreen code={code} on:close={() => scanFullscreenOpen = false} />
{/if}

<style>
    .scan {
        position: fixed;
        width: 400px;
        bottom: 0px;
        bottom: calc(env(safe-area-inset-bottom) - 140px);
        right: 5%;
        transition: bottom 0.2s cubic-bezier(0.075, 0.82, 0.165, 1);
    }
    .scan.open {
        bottom: 0px;
        bottom: calc(env(safe-area-inset-bottom));
    }
    .barcode {
        height: 80px;
        background-color: white;
        display: flex;
        justify-content: center;
        align-items: center;
        overflow: hidden;
    }
    .barcode canvas {
        width: 100%;
        height: 100%;
        image-rendering: pixelated;
        image-rendering: crisp-edges;
    }
    .btnrow {
        display: flex;
        gap: 10px;
        padding: 10px;
        height: 40px;
        justify-content: center;
        background-color: white;
    }
    .scanPullTab {
        background-color: var(--primary);
        text-align: center;
        color: white;
        padding: 1em;
        height: 50px;
        width: 100%;
        border-radius: 10px 10px 0 0;
        cursor: pointer;
        border: none;

        display: flex;
        align-items: center;
        justify-content: center;
        gap: 10px;
    }
    @media screen and (max-width: 600px) {
        .scan {
            width: calc(100% - 20px);
            left: 10px;
            right: 10px;
            bottom: calc(-15% - 2px);
            bottom: calc(calc(env(safe-area-inset-bottom) - 15%) - 2px);
            height: 20%;
        }
        .scan.open {
            bottom: 60px;
            bottom: calc(env(safe-area-inset-bottom) + 60px);
        }
        .barcode {
            height: calc(100% - 50px);
            justify-content: flex-start;
        }
        .barcode canvas {
            height: 100%;
        }
    }
</style>