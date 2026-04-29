<script lang="ts">
    import { LottiePlayer } from "@lottiefiles/svelte-lottie-player";
    import { onMount } from "svelte";
    import { fade } from "svelte/transition";
    import Onboarding from "./onboarding/Onboarding.svelte";
    import Home from "./home/Home.svelte";
    import sessionId, { globalError, logout } from "./getStore";
    import Loading from "./assets/Loading.svelte";
    import Share from "./share/Share.svelte";
    import Saved from "./home/saved/Saved.svelte";

    let lottiePlayer: LottiePlayer;

    let animationDone = false;
    $: {
        if ($sessionId !== null && lottiePlayer && !animationDone) {
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
            {#if $globalError}
                <div class="error-container">
                    <p class="error-message">
                        {#if $globalError.startsWith("9510|")}
                            Your session was invalidated.<br />This can happen if you logged in on another device, or marked this device as lost.<br />Please log in again to continue.
                        {:else}
                            {$globalError}
                        {/if}
                    </p>
                    <Saved headless={true} />
                    <button class="dangerBtn logoutBtn" on:click={() => logout()}>Log in again</button>
                </div>
            {/if}
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
        flex-direction: column;
        justify-content: center;
        align-items: center;
        z-index: 999;
        background-color: #222;
    }
    .error-container {
        margin-top: -2rem;
        max-width: 100%;
        display: flex;
        align-items: center;
        flex-direction: column;
    }
    .error-message {
        padding: 0;
        margin: 1rem;
        text-align: center;
    }
    .logoutBtn {
        padding: 10px 40px;
    }
    .error-message {
        color: red;
    }
</style>