<script>
  import IconMuted from "$lib/shared/VideoPlayer/icons/speaker-muted.svelte";
  import IconUnmuted from "$lib/shared/VideoPlayer/icons/speaker-unmuted.svelte";

  export let muted;

  function toggleMute(event) {
    event.stopPropagation();
    muted = !muted;
  }
</script>

<div class="g-video_toggle-mute">
  <button on:click={toggleMute}>
    <span class="label">{muted ? "Muted" : "Unmuted"}</span>
    <span class="icon-wrapper" class:active={muted}>
      <IconMuted />
    </span>
    <span class="icon-wrapper" class:active={!muted}>
      <IconUnmuted />
    </span>
  </button>
</div>

<style>
  .g-video_toggle-mute {
    box-sizing: border-box;
    pointer-events: all;
    cursor: pointer;
    background-color: var(--g-custom-controls-background-color);
    border-radius: var(--g-custom-controls-border-radius);
    padding-block: var(--g-custom-controls-padding-block);
    padding-inline: calc(var(--g-custom-controls-padding-block) * 2)
      var(--g-custom-controls-padding-block);
  }

  button {
    background-color: transparent;
    font: var(--g-custom-controls-font-shorthand);
    color: var(--g-custom-controls-color);
    display: flex;
    align-items: center;
    transition: opacity 0.25s ease-out;
    opacity: var(--g-custom-controls-opacity);
  }

  button:hover {
    opacity: 1;
  }

  button:focus {
    outline: none;
  }

  .icon-wrapper {
    display: none;
    height: var(--g-custom-controls-icon-size);
    width: var(--g-custom-controls-icon-size);
    margin-left: 5px;
  }

  .icon-wrapper.active {
    display: inline-block;
  }
</style>
