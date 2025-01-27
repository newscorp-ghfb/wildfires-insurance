<script>
  import Base from "$lib/shared/Media/Base.svelte";
  import { windowWidth } from "$lib/stores.js";
  import { archiemlPropsForBreakpoint } from "$lib/shared/utils/breakpoints.js";

  /**
   * Throw an error if give media is of a type that doesn't match this value, if set.
   * @type {import('./index').ExpectedType}
   */
  export let expectedType = "";

  export let props = {};

  $: ({
    // image, video and graphic
    media,
    lazy,
    role,
    altText,

    // audio and video specific
    poster,
    autoplay,
    controls,
    loop,
    muted,
    playsinline,
    preload,
    ratio,

    // svelte-video-player-specific
    videoPlayerOptions,

    // Scoop Image
    cropName,

    // vhs
    ads,
    vhsOptions,
  } = /** @type {import("./index").MediaProps}  */ (
    archiemlPropsForBreakpoint(props, $windowWidth)
  ));

  const { debug } = props;
</script>

<Base
  {media}
  {lazy}
  {role}
  {altText}
  {poster}
  {autoplay}
  {controls}
  {loop}
  {muted}
  {playsinline}
  {preload}
  {videoPlayerOptions}
  {cropName}
  {expectedType}
  {ratio}
  {ads}
  {vhsOptions}
  {debug}
/>
