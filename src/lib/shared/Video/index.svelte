<script>
  import NoScriptCheck from "$lib/shared/NoScriptCheck/index.svelte";

  // props that map directly to HTML5 Video element attributes
  export let src = "";
  export let poster = "";
  export let width = "";
  export let height = "";
  export let autoplay = false;
  export let controls = true;
  export let loop = false;
  export let playsinline = true;
  export let preload = "auto";
  export let altText = "tk";

  // configurable video element class name
  export let className = "g-video";

  /**
   * Bindable reference to video element
   * @type HTMLVideoElement?
   * */
  export let videoEl = null;

  // bound to video element and exported up
  export let currentTime = null;
  export let duration = null;
  export let muted = false;
  export let paused = null;
  export let ended = null;
  export let buffered = null;
  export let readyState = null;

  $: if (readyState && !duration && videoEl?.duration)
    duration = videoEl.duration;
</script>

<!-- svelte-ignore a11y-media-has-caption -->
<NoScriptCheck>
  <video
    bind:this={videoEl}
    bind:currentTime
    bind:duration
    bind:muted
    bind:paused
    bind:ended
    bind:buffered
    bind:readyState
    class="{className} readystate-{readyState || 0}"
    {src}
    {autoplay}
    {poster}
    {width}
    {height}
    {controls}
    {loop}
    {playsinline}
    {preload}
    aria-label={altText || undefined}
    disableRemotePlayback
  />
</NoScriptCheck>

<style>
  video {
    display: block;
    width: 100%;
  }
</style>
