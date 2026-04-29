<script lang="ts">
    import { IconPlus, IconScan, IconTrash, IconAlertCircle } from "@tabler/icons-svelte";
    import { fade } from "svelte/transition";

    let savedCodes: string[] = JSON.parse(localStorage.getItem("get-savedCodes") || "[]");
    let addCodeModalOpen = false;
    let addCodeValue = "";
    let addCodeError = "";
    export let headless = false;

    function saveCode(): string {
        if (!addCodeValue) return;

        if (addCodeValue.startsWith(document.location.origin)) {
            let code = addCodeValue.split("?")[1].split("=")[1];
            savedCodes = [...savedCodes, code];
            localStorage.setItem("get-savedCodes", JSON.stringify(savedCodes));
            addCodeModalOpen = false;
            addCodeError = "";
            addCodeValue = "";
        } else {
            addCodeError = "Invalid URL";
            return "";
        }
    }

    function deleteCode(i: number) {
        if (confirm("Are you sure you want to delete this code? This can't be undone.")) {
            savedCodes = savedCodes.filter((_, index) => index !== i);
            localStorage.setItem("get-savedCodes", JSON.stringify(savedCodes));
        }
    }
</script>

{#if !headless || savedCodes.length > 0}
<div class="savedCodes">
    {#if !headless}
    <h2>Saved codes</h2>
    {/if}
    <div class="codes">
        {#each savedCodes as savedCode, i}
            <a class="code" href={document.location.origin + document.location.pathname + `?share=${savedCode}`}>
                <button class="dangerBtn" on:click={(e) => { e.stopPropagation(); e.preventDefault(); deleteCode(i) }}>
                    <IconTrash />
                </button>
                <IconScan size={48} />
                <p>{savedCode}</p>
            </a>
        {/each}
        <button class="code addCode" on:click={() => addCodeModalOpen = true}>
            <IconPlus size={48} />
        </button>
    </div>
</div>
{/if}

{#if addCodeModalOpen}
<!-- svelte-ignore a11y-no-static-element-interactions -->
<div class="shareModal" transition:fade={{duration: 100}} on:click={() => addCodeModalOpen = false}>
    <!-- svelte-ignore a11y-no-static-element-interactions -->
    <div class="shareModalInner" on:click={(e) => e.stopPropagation()}>
            <h2 style="margin-bottom: 0">Save a shared code</h2>
            <p style="margin-top: 0">This won't prevent the code from being revoked. You'll have to delete it manually if it stops working.</p>
            <div style="display: flex; gap: 10px; align-items: center">
                <input on:change={saveCode} bind:value={addCodeValue} style="width: calc(100% - 40px)" type="text" placeholder={location.origin + location.pathname + "?share=..."} />
                <button on:click={saveCode}>
                    <IconPlus />
                </button>
            </div>
            {#if addCodeError}
                <div class="notice" style="color: red; padding: 10px 0">
                    <IconAlertCircle />
                    {addCodeError}
                </div>
            {/if}
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
    }
    .shareModalInner {
        background-color: white;
        color: black;   
        padding: 20px;
        border-radius: 10px;
        box-shadow: 0 0 10px rgba(0, 0, 0, 0.5);
        max-width: min(100%, 700px);
        position: relative;
    }
    .notice {
        display: flex;
        gap: 10px;
        align-items: center;
        color: #ccc;
        font-size: 0.9em;
    }
    .savedCodes {
        margin: 0 auto;
        max-width: min(1200px, 100%);
        padding: 20px 0;
    }
    .savedCodes h2 {
        padding: 0 20px;
        box-sizing: border-box;
    }
    .savedCodes .code:first-child {
        margin-left: 20px;
    }
    .savedCodes .code:last-child {
        margin-right: 20px;
    }
    .codes {
        display: flex;
        overflow-y: auto;
        gap: 10px;
    }
    .code {
        width: 200px;
        height: 100px;
        position: relative;
        flex-shrink: 0;
        color: white;
        background-color: #333;
        border-radius: 5px;
        border: 1px solid #aaa;
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        transition: all 0.2s;
    }
    @media (prefers-color-scheme: light) {
        .code {
            color: black;
        }
    }
    .code:hover {
        background-color: #444;
        border-color: #eee;
    }
    @media (prefers-color-scheme: light) {
        .code:hover {
            color: white;
        }
    }
    .code .dangerBtn {
        border-radius: 0 5px 0 0;
        position: absolute;
        top: 0;
        right: 0;
        padding: 5px;
        background-color: #222;
        transition: all 0.2s;
    }
    .code .dangerBtn:hover {
        background-color: var(--danger);
    }
    .code p {
        margin: 0;
        font-size: 2em;
        font-family: monospace;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        width: 90%;
        color: #999;
    }
    .addCode {
        background-color: transparent;
        border: 1px solid #aaa;
    }
</style>