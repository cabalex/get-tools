<script lang="ts">
    import { IconSettings, IconExclamationCircle, IconCirclePlus, IconDeviceMobile, IconTrash, IconCopy } from "@tabler/icons-svelte";
    import { createEventDispatcher } from "svelte";
    import { fade } from "svelte/transition";
    import { addSharedDevice, makeGETRequest, revokeOptions, revokeSharedDevice, sharedDevices } from "../../../getStore";
    import Loading from "../../../assets/Loading.svelte";
    import RevokeOptions from "./RevokeOptions.svelte";
    import BoolInput from "../../../assets/BoolInput.svelte";

    const dispatcher = createEventDispatcher();
    let loading = false;
    let showSettings = false;

    let allowViewBalance = true;
    let allowRevoking = false;

    async function createSharedDevice() {
        loading = true;

        let deviceId = Math.round(Math.random() * 100_000_000_000_000_000).toString(16).padStart(16, "9");
        let pin = Math.floor(Math.random() * 9999).toString().padStart(4, "0");


        let response = await makeGETRequest("user", "createPIN", {
            deviceId,
            PIN: pin
        });

        if (response.response === true) {
            addSharedDevice(deviceId, pin);
        }
        loading = false;
    }

    let revokingAll = false;
    async function revokeAllCodes() {
        revokingAll = true;
        for (let sharedDevice of $sharedDevices) {
            await revokeSharedDevice(sharedDevice.deviceId, sharedDevice.pin);
        }
        revokingAll = false;
    }

    function copyLink(deviceId: string, pin: string, e) {
        let query = deviceId + pin + (allowViewBalance ? "1" : "0") + (allowRevoking ? "1" : "0");
        if ($revokeOptions) {
            query += JSON.stringify($revokeOptions);
        }
        navigator.clipboard.writeText(location.origin + location.pathname + `?share=${encodeURIComponent(btoa(query))}`);
        let buttonElem = e.target.closest("button");
        buttonElem.style.backgroundColor = "green";
        setTimeout(() => buttonElem.style.backgroundColor = "", 1000);
    }
</script>
<!-- svelte-ignore a11y-no-static-element-interactions -->
<div class="shareModal" transition:fade={{duration: 100}} on:click={() => dispatcher("close")}>
    <!-- svelte-ignore a11y-no-static-element-interactions -->
    <div class="shareModalInner" on:click={(e) => e.stopPropagation()}>
        <button class="settingsBtn" on:click={() => showSettings = true}>
            <IconSettings />
        </button>
        <h2>Share with your friends</h2>
        <p>Create a temporary code to let your friends pay with your points.</p>
        <div class="warning">
            <IconExclamationCircle /> 
            <span>Creating temporary codes allows other people access to your GET account.<br /> Only share this link with people you trust!</span>
        </div>
        {#if $sharedDevices && $sharedDevices.length > 0}
            <RevokeOptions />
            <div style="margin: 10px 0; display: flex; justify-content: flex-end">
                <button class="dangerBtn" disabled={revokingAll} on:click={revokeAllCodes}>
                    {revokingAll ? "Revoking..." : "Revoke all codes"}
                </button>
            </div>
        {/if}
        {#each $sharedDevices as sharedDevice}
        <div class="sharedDevice">
            <IconDeviceMobile />
            <div class="text">
                <h3>Shared code</h3>
                <p class="small">{sharedDevice.deviceId} • {sharedDevice.pin}</p>
            </div>
            <button on:click={copyLink.bind(null, sharedDevice.deviceId, sharedDevice.pin)}>
                <IconCopy />
                <span>Copy</span>
            </button>
            <button class="dangerBtn" on:click={revokeSharedDevice.bind(null, sharedDevice.deviceId, sharedDevice.pin)}>
                <IconTrash />
                <span>Revoke</span>
            </button>
        </div>
        {/each}
        {#if loading}
        <div class="sharedDevice">
            <Loading color="black" />
        </div>
        {/if}
        <div class="centeredBtnrow">
            <button on:click={createSharedDevice}>
                <IconCirclePlus />
                Generate Code
            </button>
        </div>
        <p style="margin: 0; text-align: center;" class="small">No data is sent to GET Tools and secure info is only shared via link.</p>
    </div>
</div>

{#if showSettings}
<!-- svelte-ignore a11y-no-static-element-interactions -->
<div class="shareModal settings" transition:fade={{duration: 100}} on:click={(e) => {showSettings = false; e.stopPropagation()}}>
    <!-- svelte-ignore a11y-no-static-element-interactions -->
    <div class="shareModalInner settings" on:click={(e) => e.stopPropagation()}>
        <h2 style="margin: 0">Share settings</h2>
        <p style="margin: 0">Only applies to new codes.</p>
        <BoolInput bind:value={allowRevoking} label="Let users revoke codes" />
        <BoolInput bind:value={allowViewBalance} label="Let users view your balance" />
    </div>
</div>
{/if}

<style>
    .shareModal {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background-color: rgba(0, 0, 0, 0.5);
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        z-index: 100;
        text-align: center;
    }
    .shareModalInner {
        background-color: white;
        color: black;   
        padding: 20px;
        border-radius: 10px;
        box-shadow: 0 0 10px rgba(0, 0, 0, 0.5);
        max-width: 700px;
        position: relative;
    }
    .shareModalInner.settings {
        text-align: left;
    }
    .settingsBtn {
        background-color: transparent;
        color: #111;
        padding: 10px;
        position: absolute;
        right: 10px;
        top: 10px;
    }
    .settingsBtn:hover {
        background-color: rgba(0, 0, 0, 0.2)
    }
    h2 {
        margin: 10px 0;
    }
    .centeredBtnrow {
        margin: 10px 0;
        width: 100%;
        display: flex;
        justify-content: center;
    }
    .sharedDevice {
        display: flex;
        gap: 10px;
        align-items: center;
        border: 2px solid var(--primary);
        margin: 10px 0;
        padding: 5px 10px;
        border-radius: 10px;
        text-align: left;
    }
    .sharedDevice .text {
        width: 100%;
    }
    .sharedDevice .text > * {
        margin: 0;
    }
    .sharedDevice .small {
        font-family: monospace;
    }
    button {
        transition: background-color 0.1s ease-in-out;
    }
    @media screen and (max-width: 550px) {
        button span {
            display: none;
        }
    }
</style>