<script>
  import IconStartOver from "$lib/shared/VideoPlayer/icons/start-over.svelte";

  export let active;
  export let currentTime;

  function resetPlayback() {
    currentTime = 0;
    active = true;
  }
</script>

<div class="play-again">
  <button on:click={resetPlayback}>
    <span class="icon-wrapper"><IconStartOver /></span>
    <span class="play-again-label">Play again</span>
  </button>
</div>

<style>
  .play-again {
    background-color: var(--g-custom-controls-background-color);
    width: 100%;
    height: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
  }

  button {
    -webkit-appearance: none;
    background-color: transparent;
    opacity: var(--g-custom-controls-opacity);
    display: flex;
    flex-direction: column;
    align-items: center;
    pointer-events: all;
  }

  button:hover {
    opacity: 1;
  }

  button:focus {
    outline: none;
  }

  .icon-wrapper {
    display: inline-block;
    width: 32px;
    height: 32px;
    margin-bottom: 10px;
  }

  .play-again-label {
    font: var(--g-custom-controls-font-shorthand);
    color: var(--g-custom-controls-color);
  }
</style>
