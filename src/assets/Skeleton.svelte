<script lang="ts">
    export let height = 50;
</script>

<div class="skeleton" style="height: {height}px" />

<style>
    .skeleton {
        background: linear-gradient(90deg, #555, #999, #555);
        border-radius: 10px;
        animation: skeleton 2s infinite;
        margin: 10px;
    }

    @keyframes skeleton {
        0% {
            background-position-x: 0;
        }
        50% {
            background-position-x: 50vw;
        }
        100% {
            background-position-x: 100vw;
        }
    }
</style>