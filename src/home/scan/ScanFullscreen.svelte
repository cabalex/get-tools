<script lang="ts">
    import { IconBarcode, IconBarcodeOff, IconCheck, IconUser, IconChevronLeft } from "@tabler/icons-svelte";
    import { createEventDispatcher, onMount, onDestroy } from "svelte";
    import * as PDF417 from "pdf417-generator";
    import '../../share/ShareFullscreen.css';
    import { fly } from "svelte/transition";

    let canvasElem: HTMLCanvasElement;
    let invalid = false;
    let lightTheme = localStorage.getItem("get-codetheme") === "light";

    const dispatch = createEventDispatcher();

    export let code = "";

    $: {
        if (code && canvasElem) {
            PDF417.draw(code, canvasElem, 3);
        }
    }
    $: {
        localStorage.setItem("get-codetheme", lightTheme ? "light" : "dark");
    }

    onMount(() => {
        document.body.style.overflow = "hidden";
    });

    onDestroy(() => {
        document.body.style.overflow = "";
    });
</script>
<div class="shareModal" class:light={lightTheme} transition:fly={{duration: 100, y: 100}}>
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
                {/if}
            </div>
            <div class="barcode">
                <canvas bind:this={canvasElem} />
            </div>
            <button class="dangerBtn" on:click={() => dispatch("close")}>Close</button>
        {:else}
            <div class="shareHeader">
                <IconBarcodeOff size={256} />
                <h2>Code revoked</h2>
                <h3>Ask the account owner for a new one!</h3>
                <p class="credit">Share your points with <a style="color: white" href="https://cabalex.github.io/get-tools">GET Tools</a></p>
            </div>
        {/if}
    </section>
</div>

<style>
    .shareModal {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background-color: #222;
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        z-index: 100;
        text-align: center;
    }
    .shareModal.light {
        background-color: #CBCBCB;
    }
    .shareClient.light {
        top: 40px;
    }
    .shareOuterHeader {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
    }
</style>