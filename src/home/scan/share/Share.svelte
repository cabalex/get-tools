<script lang="ts">
    import { IconExclamationCircle, IconCirclePlus, IconDeviceMobile, IconTrash, IconCopy } from "@tabler/icons-svelte";
    import { createEventDispatcher } from "svelte";
    import { fade } from "svelte/transition";
    import { addSharedDevice, makeGETRequest, removeSharedDevice, sharedDevices } from "../../../getStore";
    import Loading from "../../../assets/Loading.svelte";

    const dispatcher = createEventDispatcher();
    let loading = false;

    async function createSharedDevice() {
        loading = true;

        let deviceId = Math.round(Math.random() * 100_000_000_000_000_000).toString(16).padStart(16, "9");
        let pin = Math.floor(Math.random() * 1000).toString().padStart(4, "0");


        let response = await makeGETRequest("user", "createPIN", {
            deviceId,
            PIN: pin
        });

        if (response.response === true) {
            addSharedDevice(deviceId, pin);
        }
        loading = false;
    }

    async function revokeSharedDevice(deviceId: string, pin: string) {
        let response = await makeGETRequest("user", "deletePIN", {
            deviceId
        });

        if (response.response === true) {
            removeSharedDevice(deviceId, pin);
            loading = false;
        } else {
            loading = false;
        }
    }

    let revokingAll = false;
    async function revokeAllCodes() {
        revokingAll = true;
        for (let sharedDevice of $sharedDevices) {
            await revokeSharedDevice(sharedDevice.deviceId, sharedDevice.pin);
        }
        revokingAll = false;
    }

    function copyLink(deviceId: string, pin: string) {
        navigator.clipboard.writeText(location.origin + location.pathname + `?share=${encodeURIComponent(btoa(JSON.stringify({ deviceId, pin })))}`);
    }
</script>
<!-- svelte-ignore a11y-no-static-element-interactions -->
<div class="shareModal" transition:fade={{duration: 100}} on:click={() => dispatcher("close")}>
    <!-- svelte-ignore a11y-no-static-element-interactions -->
    <div class="shareModalInner" on:click={(e) => e.stopPropagation()}>
        <h2>Share with your friends</h2>
        <p>Create a temporary code to let your friends pay with your points.</p>
        <div class="warning">
            <IconExclamationCircle /> 
            <span>Creating temporary codes allows other people access to your GET account.<br /> Only share this link with people you trust!</span>
        </div>
        {#if $sharedDevices && $sharedDevices.length > 0}
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
                <p class="small">{sharedDevice.deviceId} - {sharedDevice.pin}</p>
            </div>
            <button on:click={copyLink.bind(null, sharedDevice.deviceId, sharedDevice.pin)}>
                <IconCopy /> Copy
            </button>
            <button class="dangerBtn" on:click={revokeSharedDevice.bind(null, sharedDevice.deviceId, sharedDevice.pin)}>
                <IconTrash /> Revoke
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
    }
    .shareModalInner {
        background-color: white;
        color: black;   
        padding: 20px;
        border-radius: 10px;
        box-shadow: 0 0 10px rgba(0, 0, 0, 0.5);
        max-width: 700px;
    }
    .warning {
        border: 1px solid orange;
        background-color: rgba(255, 165, 0, 0.1);
        padding: 10px;
        border-radius: 10px;
        font-weight: bold;
        display: flex;
        gap: 10px;
        align-items: center;
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
    }
    .sharedDevice .text {
        width: 100%;
    }
    .sharedDevice .text > * {
        margin: 0;
    }
</style>