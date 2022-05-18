<script lang="ts">
    import { createEventDispatcher } from 'svelte';

    const dispatch = createEventDispatcher();

    function click() {
        dispatch('click');
    }
</script>

<button on:click={click}>
    play
</button>
