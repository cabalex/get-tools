<script lang="ts">
    export let label: string;
    export let description: string|null = null;

    export let value = false;
</script>

<div class="input">
    <div class="text">
        <h4>{label}</h4>
        {#if description}
            <p>{description}</p>
        {/if}
    </div>
    <div 
        role="button"
        tabindex="0"
        aria-label="check"
        class="switch"
        class:active={value}
        on:click={() => value = !value}
    >
        <span class="slider" />
    </div>
</div>

<style>
    .input {
        width: calc(100% - 20px);
        display: flex;
        flex-direction: row;
        gap: 10px;
        padding: 5px 10px;
    }
    .text {
        margin: 10px;
        display: flex;
        flex-direction: column;
    }
    .text {
        flex-grow: 1;
        font-size: 1em;
    }
    h4, p {
        margin: 0;
    }
    .switch {
        align-self: center;
        display: flex;
    }
    .switch .slider {
        position: relative;
        cursor: pointer;
        background-color: #555;
        transition: 0.2s ease-in-out;
        border-radius: 34px;
        height: 34px;
        width: 60px;
    }
    .switch .slider:before {
        position: absolute;
        content: "";
        height: 26px;
        width: 26px;
        left: 4px;
        bottom: 4px;
        background-color: white;
        transition: 0.2s ease-in-out;
        border-radius: 50%;
    }
    .switch.active .slider {
        background-color: var(--primary);
    }
    .switch.active .slider:before {
        transform: translateX(26px);
    }
</style>