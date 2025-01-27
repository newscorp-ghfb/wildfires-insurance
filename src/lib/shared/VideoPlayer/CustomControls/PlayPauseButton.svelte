<script>
  import IconPlay from "$lib/shared/VideoPlayer/icons/play.svelte";
  import IconPause from "$lib/shared/VideoPlayer/icons/pause.svelte";

  export let active;
  export let paused;

  function togglePlay(event) {
    event.stopPropagation();
    active = !active;
  }
</script>

<button on:click={togglePlay}>
  <span class="icon-wrapper" class:active={paused || paused === null}>
    <IconPlay />
  </span>
  <span class="icon-wrapper" class:active={paused === false}>
    <IconPause />
  </span>
</button>

<style>
  button {
    pointer-events: all;
    opacity: var(--g-custom-controls-opacity);
    -webkit-appearance: none;
    background-color: transparent;
  }

  button:hover {
    opacity: 1;
  }

  .icon-wrapper {
    display: none;
    height: var(--g-custom-controls-icon-size);
    width: var(--g-custom-controls-icon-size);
  }

  .icon-wrapper.active {
    display: block;
  }
</style>
