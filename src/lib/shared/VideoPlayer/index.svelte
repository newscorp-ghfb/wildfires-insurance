<script>
  import { createEventDispatcher, onMount, onDestroy } from "svelte";
  import CustomControls from "$lib/shared/VideoPlayer/CustomControls/index.svelte";
  import Video from "$lib/shared/Video/index.svelte";
  import Loading from "$lib/shared/VideoPlayer/Loading.svelte";
  import IconPlay from "$lib/shared/VideoPlayer/icons/play.svelte";
  import { getBestFitRendition } from "$lib/shared/Media/utils.js";
  import { hasJs, shouldReduceMotion } from "$lib/stores.js";
  import inView from "$lib/shared/actions/inView.js";

  /**
   * MediaRenditions array of possible source video urls which will be automatically selected by player.
   * @type {import('../Media/index').MediaRenditions}
   */
  export let renditions = [];

  /**
   * MediaRenditions array of possible poster urls which will be automatically selected by player.
   * @type {import('../Media/index').MediaRenditions}
   */
  export let posters = [];

  /** Url to valid video file. Overrides passed in `renditions` mediaRenditions. */
  export let src = "";
  /** Url to poster image .Overrides passed in `posters` mediaRenditions*/
  export let poster = "";
  /** string representation of aspect ratio in w:h form, like 16:9 */
  export let ratio = "";

  // The used src, poster and ratio are either passed in from
  // src, poster and ratio prop, or derived from renditions/posters mediaRenditions.
  // And those values are cached here.
  let _src = src;
  let _poster = poster;
  let _ratio = ratio;

  // input ratio format converted to CSS var
  let aspectRatioStyle = "";

  // Wrapper element attributes
  export let id = "";

  // Video element attributes
  export let autoplay = false;
  export let loop = false;
  export let muted = false;
  export let playsinline = true;
  export let preload = "auto";
  export let altText = "tk";
  export let controls = false;

  /** @type {import("./index").videoPlayerOptions} */
  export let videoPlayerOptions = {};

  const videoPlayerOptionsDefaults = {
    customControls: true,
    playOnlyWhenInView: autoplay && muted ? true : false,
    treatAsImageIfCantAutoplay: false,
  };

  const _videoPlayerOptions = {
    ...videoPlayerOptionsDefaults,
    ...videoPlayerOptions,
  };

  /** @type {boolean} */
  const customControls = _videoPlayerOptions.customControls;

  /** @type {boolean} */
  // By default, cinemagraphs have playOnlyWhenInView set to true;
  // but click-to-play videos don't
  let playOnlyWhenInView = _videoPlayerOptions.playOnlyWhenInView;

  /** @type {boolean} */
  const treatAsImageIfCantAutoplay =
    _videoPlayerOptions.treatAsImageIfCantAutoplay;

  /** @type {import("./index").subtitle[] | undefined} */
  const subtitles = _videoPlayerOptions.subtitles;

  // For custom playback
  /** @type {boolean} */
  export let active = autoplay;

  /** @type {number} */
  export let volume = 1;

  /** @type {import("./index").customControlsOptions} */
  export let customControlsOptions = {};

  if ($shouldReduceMotion) {
    autoplay = false;
    playOnlyWhenInView = false;
  }

  // This prevents a cinamegraph at the top of the page
  // from stopping and then playing again
  /** @type {boolean} */
  let intersecting = playOnlyWhenInView;

  const eventDispatcher = createEventDispatcher();

  /**
   * Wrapper around eventDispatcher
   * @param {string} eventName
   * @param {any} [data]
   */
  const dispatch = (eventName, data) => {
    eventDispatcher(eventName, data);
  };

  // Video element
  let videoEl;

  // Native video events forwarded from Video component
  let currentTime;
  let duration;
  let paused;
  let ended;
  let buffered;
  let readyState;

  // bound to containing element
  let videoWidth = 0;

  /**
   * Choose a src from either passed in `src` prop, or the
   * bestFit value of renditions:MediaRendition[].
   * Prefer passed in prop.
   */
  const updateSrc = () => {
    if (src) {
      _src = src;
    } else if (renditions.length) {
      _src = getBestFitRendition(renditions, videoWidth).url;
    }
  };

  /**
   * Choose a poster from either passed in `poster` prop, or the
   * bestFit value of posters:MediaRendition[].
   * Prefer passed in prop.
   */
  const updatePoster = () => {
    if (poster) {
      _poster = poster;
    } else if (posters.length) {
      _poster = getBestFitRendition(posters, videoWidth).url;
    }
  };

  // Video renditions should include height and width, but at moment there's both a bug that misses some videotape
  // files and their metadata, and we should account for cases where we will never know the height before video load.
  // https://github.com/newsdev/birdkit/issues/676
  const updateRatio = () => {
    if (ratio) {
      _ratio = ratio;
    } else if (renditions.length) {
      const bestRendition = getBestFitRendition(renditions, videoWidth);

      if (bestRendition.width && bestRendition.height) {
        _ratio = `${bestRendition.width}:${bestRendition.height}`;
      }
    }

    // convert '16:9' to ['16', '9'] and ensure both values are actually numbers,
    // then convert to CSS variable
    const parts = _ratio.split(":");
    if (parts.every((numStr) => !!parseInt(numStr))) {
      const ratio = parseInt(parts[0]) / parseInt(parts[1]);
      aspectRatioStyle = `--g-aspect-ratio: ${ratio}`;
    } else {
      console.warn(
        `Could not determine aspect ratio for video ${
          renditions[0] || src
        }, please pass in a ratio prop manually.`,
      );
    }
  };

  const updateMedia = () => {
    updateSrc();
    updatePoster();
    updateRatio();
  };

  // update src, poster and ratio as needed
  $: renditions || posters || poster || src || videoWidth, updateMedia();

  // dispatch events of note
  $: dispatchCurrentTime(currentTime);
  $: dispatchPaused(paused);
  $: dispatchEnded(ended);

  // custom playback
  $: observerPlayback(intersecting);
  $: playVideo(active, videoEl);
  $: pauseVideo(active, videoEl);
  $: setVolume(volume, videoEl);
  $: useCustomControls = $hasJs && customControls;

  // Likely low power mode
  $: playbackNotStarted =
    currentTime === 0 && (paused === true || paused === undefined);
  $: cantAutoplay = playbackNotStarted || $shouldReduceMotion;

  function dispatchCurrentTime(/** @type {number} */ currentTime) {
    dispatch("video_current_time", currentTime);
  }

  function dispatchPaused(/** @type {boolean} */ paused) {
    if (paused) dispatch("video_paused");
  }

  function dispatchEnded(/** @type {boolean} */ ended) {
    if (ended) dispatch("video_ended");
  }

  function observerPlayback(intersecting) {
    if (!playOnlyWhenInView) return;
    active = intersecting;
  }

  function playVideo(active, videoEl) {
    if (!videoEl) return;
    if (active) {
      const playPromise = videoEl.play();
      if (playPromise !== undefined) {
        playPromise.catch((error) => {
          console.log(error);
        });
      }
    }
  }

  function pauseVideo(active, videoEl) {
    if (!videoEl) return;
    if (!active) videoEl.pause();
  }

  function setVolume(volume, videoEl) {
    if (!videoEl) return;
    videoEl.volume = volume;
  }

  function playFallback(event) {
    event.stopPropagation();
    if (!autoplay) {
      active = true;
    } else {
      playVideo(active, videoEl);
    }
  }

  function onPlaying() {
    if (!active) active = true;
  }

  function onPause() {
    if (active) active = false;
  }

  onMount(() => {
    videoEl.addEventListener("playing", onPlaying);
    videoEl.addEventListener("pause", onPause);
  });

  onDestroy(() => {
    if (!videoEl) return;
    videoEl.removeEventListener("playing", onPlaying);
    videoEl.removeEventListener("pause", onPause);
  });
</script>

<div
  {id}
  class="g-videoplayer_wrapper"
  style={aspectRatioStyle}
  bind:clientWidth={videoWidth}
  use:inView
  on:enter={() => (intersecting = true)}
  on:exit={() => (intersecting = false)}
>
  <Video
    bind:videoEl
    bind:currentTime
    bind:duration
    bind:muted
    bind:paused
    bind:ended
    bind:buffered
    bind:readyState
    src={_src}
    poster={_poster}
    className={"g-videoplayer"}
    {controls}
    {autoplay}
    {loop}
    {playsinline}
    {preload}
    {altText}
  />
  <img
    alt="poster for video"
    class="g-videoplayer_poster"
    class:active={!currentTime && cantAutoplay}
    src={_poster}
  />
  {#if !treatAsImageIfCantAutoplay}
    <button
      class="g-videoplayer_play-fallback"
      class:active={!currentTime && cantAutoplay}
      on:click={playFallback}
    >
      <IconPlay />
    </button>
  {/if}

  {#if useCustomControls}
    <CustomControls
      bind:currentTime
      bind:paused
      bind:muted
      bind:active
      {ended}
      {duration}
      {loop}
      {subtitles}
      {customControlsOptions}
    />
  {/if}
  <Loading active={paused === false && !buffered} />
  {#if $$slots.default}<div class="g-videoplayer_overlay"><slot /></div>{/if}
</div>

<style>
  .g-videoplayer_wrapper {
    position: relative;
    aspect-ratio: var(--g-aspect-ratio);
  }

  .g-videoplayer_overlay {
    position: absolute;
    top: 0;
    right: 0;
    bottom: 0;
    left: 0;
  }

  .g-videoplayer_poster {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: none;
  }

  .g-videoplayer_poster.active {
    display: block;
  }

  .g-videoplayer_play-fallback {
    position: absolute;
    top: 50%;
    left: 50%;
    width: 40px;
    height: 40px;
    transform: translate(-50%, -50%);
    background-color: transparent;
    display: none;
  }

  .g-videoplayer_play-fallback.active {
    display: block;
  }
</style>
