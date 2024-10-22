<script lang="ts">
    import { LottiePlayer } from "@lottiefiles/svelte-lottie-player";
    import { onMount } from "svelte";
    import { fade } from "svelte/transition";
    import Onboarding from "./onboarding/Onboarding.svelte";
    import Home from "./home/Home.svelte";
    import sessionId from "./getStore";
    import Loading from "./assets/Loading.svelte";
    import Share from "./share/Share.svelte";

    let lottiePlayer: LottiePlayer;

    let animationDone = false;
    $: {
        if ($sessionId !== null) {
            document.body.style.overflow = "hidden";
            lottiePlayer.getLottie().play();
            setTimeout(() => {
                animationDone = true;
                document.body.style.overflow = "";
            }, 1500);
        }
    }

    $: isActivated = !!localStorage.getItem("get-data") || $sessionId !== null;
</script>
{#if location.search.includes("share")}
    <Share />
{:else}
    {#if isActivated}
        {#if !animationDone}
        <div class="logo" out:fade={{duration: 200}}>
            <LottiePlayer bind:this={lottiePlayer} src="./logo.json" autoplay={false} height={300} width={300} controls={false} background="transparent" />
        </div>
        {/if}
        {#if $sessionId !== null}
            <Home />
        {:else}
            <Loading color="white" />
        {/if}
    {:else}
        <Onboarding />
    {/if}
{/if}

<style>
    .logo {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        margin: 0;
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 999;
        background-color: #222;
    }
</style>