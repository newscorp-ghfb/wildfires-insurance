<script>
  import IconCC from "$lib/shared/VideoPlayer/icons/cc.svelte";

  export let showCC;

  function toggleCC(event) {
    event.stopPropagation();
    showCC = !showCC;
  }
</script>

<button on:click={toggleCC} class:active={showCC}>
  <span class="icon-wrapper">
    <IconCC />
  </span>
</button>

<style>
  button {
    pointer-events: all;
    opacity: calc(var(--g-custom-controls-opacity) * 0.5);
    -webkit-appearance: none;
    background-color: transparent;
  }

  button.active {
    opacity: var(--g-custom-controls-opacity);
  }

  button:hover {
    opacity: 1;
  }

  .icon-wrapper {
    display: block;
    height: var(--g-custom-controls-icon-size);
    aspect-ratio: 132/100;
  }
</style>
