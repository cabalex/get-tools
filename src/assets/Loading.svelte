<script lang="ts">
    import { IconLoader2 } from "@tabler/icons-svelte";

    export let color = "var(--primary)";
</script>

<div class="loading" style="color: {color}">
    <IconLoader2 size="3em" />
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