<script lang="ts">
    import { IconLoader2 } from "@tabler/icons-svelte";

    export let color = "var(--primary)";
    export let size = "3em";
</script>

<div class="loading" style="color: {color}">
    <IconLoader2 size={size} />
</div>

<style>
    .loading {
        display: flex;
        justify-content: center;
        align-items: center;
        width: 100%;
        height: 100%;
    }
    :global(.loading svg) {
        animation: spin 1s linear infinite;
    }
    @keyframes spin {
        0% {
            transform: rotate(0deg);
        }
        100% {
            transform: rotate(360deg);
        }
    }
</style>