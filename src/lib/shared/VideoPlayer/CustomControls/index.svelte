<script>
  import PlayAgainButton from "$lib/shared/VideoPlayer/CustomControls/PlayAgainButton.svelte";
  import PlayPauseButton from "$lib/shared/VideoPlayer/CustomControls/PlayPauseButton.svelte";
  import ProgressBar from "$lib/shared/VideoPlayer/CustomControls/ProgressBar.svelte";
  import Time from "$lib/shared/VideoPlayer/CustomControls/Time.svelte";
  import ToggleMuteButton from "$lib/shared/VideoPlayer/CustomControls/ToggleMuteButton.svelte";
  import CCButton from "$lib/shared/VideoPlayer/CustomControls/CCButton.svelte";
  import CC from "$lib/shared/VideoPlayer/CustomControls/CC.svelte";

  // Subtitles
  /** @type {import("../index").subtitle[] | null} */
  export let subtitles = null;

  // UI defaults
  /** @type {import("../index").customControlsOptions} */
  export let customControlsOptions = {};

  const customControlsOptionsDefaults = {
    showPlayPauseButton: true,
    showTime: true,
    showToggleMuteButton: true,
    showPlayAgainButton: true,
    showProgressBar: true,
    showCC: !!subtitles,
    showCCButton: !!subtitles,
  };

  const _customControlsOptions = {
    ...customControlsOptionsDefaults,
    ...customControlsOptions,
  };

  /** @type {boolean} */
  const showPlayPauseButton = _customControlsOptions.showPlayPauseButton;

  /** @type {boolean} */
  const showTime = _customControlsOptions.showTime;

  /** @type {boolean} */
  const showToggleMuteButton = _customControlsOptions.showToggleMuteButton;

  /** @type {boolean} */
  const showPlayAgainButton = _customControlsOptions.showPlayAgainButton;

  /** @type {boolean} */
  const showProgressBar = _customControlsOptions.showProgressBar;

  /** @type {boolean} */
  let showCC = _customControlsOptions.showCC;

  /** @type {boolean} */
  const showCCButton = _customControlsOptions.showCCButton;

  // Custom playback
  /** @type {boolean} */
  export let active;

  // Video bindings
  export let currentTime;
  export let duration;
  export let paused;
  export let ended;
  export let muted;
  export let loop;
</script>

<div class="g-custom-controls">
  {#if !loop && showPlayAgainButton && ended}
    <div class="g-controls_play-again">
      <PlayAgainButton bind:currentTime bind:active />
    </div>
  {/if}

  <div class="g-custom-controls_overlay">
    <div class="g-controls_top">
      {#if showToggleMuteButton}
        <ToggleMuteButton bind:muted />
      {/if}
    </div>

    <div class="g-controls_bottom">
      {#if subtitles && showCC}
        <div class="g-controls_cc">
          <CC {currentTime} {subtitles} />
        </div>
      {/if}
      <div class="g-controls_main-ui">
        {#if showPlayPauseButton || showTime}
          <div class="g-controls_play-pause-time">
            {#if showPlayPauseButton}
              <PlayPauseButton bind:paused bind:active />
            {/if}
            {#if showTime}
              <Time {currentTime} {duration} />
            {/if}
          </div>
        {/if}
        {#if showProgressBar}
          <div class="g-controls_progress-bar">
            <ProgressBar bind:currentTime {duration} />
          </div>
        {/if}
        {#if showCCButton}
          <div class="g-controls_cc-button">
            <CCButton bind:showCC />
          </div>
        {/if}
      </div>
    </div>
  </div>
</div>

<style>
  .g-custom-controls {
    box-sizing: border-box;
    position: absolute;
    pointer-events: none;
    top: 0;
    right: 0;
    bottom: 0;
    left: 0;

    --g-custom-controls-color: white;
    --g-custom-controls-background-color: rgba(0, 0, 0, 0.48);
    --g-custom-controls-opacity: 0.8;
    --g-custom-controls-border-radius: 3px;
    --g-custom-controls-padding-block: 5px;
    --g-custom-controls-icon-size: 22px;

    --g-custom-controls-font-size: 0.875rem/1;
    --g-custom-controls-font-weight: 600;
    --g-custom-controls-font-shorthand: var(--g-custom-controls-font-weight)
      var(--g-custom-controls-font-size) var(--g-franklin);
  }

  .g-controls_play-again,
  .g-custom-controls_overlay {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
  }

  .g-custom-controls_overlay {
    box-sizing: border-box;
    padding: 5px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: space-between;
  }

  .g-controls_top,
  .g-controls_bottom {
    width: 100%;
  }

  .g-controls_top {
    display: flex;
    justify-content: flex-end;
  }

  .g-controls_main-ui {
    display: flex;
    align-items: center;
    justify-content: space-between;
    box-sizing: border-box;
    background-color: var(--g-custom-controls-background-color);
    border-radius: var(--g-custom-controls-border-radius);
  }

  .g-controls_cc {
    margin-bottom: 5px;
  }

  .g-controls_play-pause-time,
  .g-controls_cc-button {
    flex-shrink: 0;
  }

  .g-controls_play-pause-time,
  .g-controls_progress-bar,
  .g-controls_cc-button {
    padding-block: var(--g-custom-controls-padding-block);
    padding-inline: var(--g-custom-controls-padding-block);
  }

  .g-controls_progress-bar {
    width: 100%;
  }

  .g-controls_progress-bar:last-child {
    padding-right: calc(var(--g-custom-controls-padding-block) * 2);
  }

  @media (min-width: 740px) {
    .g-custom-controls {
      --g-custom-controls-icon-size: 26px;
    }
  }
</style>
