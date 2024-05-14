<script lang="ts">
    import Onboarding from "./onboarding/Onboarding.svelte";
    import Home from "./home/Home.svelte";
    import sessionId from "./getStore";
    import Loading from "./assets/Loading.svelte";
    import Share from "./share/Share.svelte";


    $: isActivated = !!localStorage.getItem("get-data") || $sessionId !== null;
</script>
{#if location.search.includes("share")}
    <Share />
{:else}
    {#if isActivated}
        {#if $sessionId !== null}
            <Home />
        {:else}
            <Loading color="white" />
        {/if}
    {:else}
        <Onboarding />
    {/if}
{/if}