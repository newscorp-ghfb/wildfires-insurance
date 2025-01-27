<script>
  import Video from "$lib/shared/Video/index.svelte";
  import VideoPlayer from "$lib/shared/VideoPlayer/index.svelte";
  import Image from "$lib/shared/Image/index.svelte";
  import ImageLoader from "$lib/shared/ImageLoader/index.svelte";
  import Slideshow from "$lib/shared/Slideshow/index.svelte";
  import Graphic from "$lib/shared/Graphic/index.svelte";
  import VHS from "$lib/shared/VHS/index.svelte";
  import Error from "$lib/shared/Error/index.svelte";

  import {
    getScoopImageRenditions,
    getLocalResponsiveImageRenditions,
    getLocalImageUrl,
    getLocalVideoUrl,
    processScoopSlideshow,
    getVideotapeRenditions,
    getVideotapePosters,
    getScoopVideoRenditions,
    getScoopVideoPosters,
    getBestFitRendition,
    getScoopAudioUrl,
    aOrAn,
  } from "./utils.js";

  import {
    AssetTypeToExpectedType,
    AvailableMediaComponentsSet,
    ExpectedTypeToComponentMapping,
  } from "$lib/shared/Media/constants.ts";

  /**@type {import('./index').MediaObject} */
  export let media;
  export let lazy = true;
  export let role = "img";
  export let altText = "";

  // Scoop Image-specific options
  export let cropName = ["MASTER", "MOBILE_MASTER"];

  // video specific options
  export let poster = "";
  export let autoplay = false;
  export let controls = false;
  export let loop = false;
  export let muted = false;
  export let playsinline = true;
  export let preload = "auto";
  export let ratio;

  // svelte-video-player-specific
  export let videoPlayerOptions = {};

  // VHS specific options
  export let ads = false;
  export let vhsOptions = {};

  /**
   * Throw an error if give media is of a type that doesn't match this value, if set.
   * @type {import('./index').ExpectedType}
   */
  export let expectedType = "";

  export let debug = false;
  /**
   *
   * @param {function} posterHandler
   * @param {number} width
   */
  const getVideoPoster = (posterHandler, width) => {
    // default to passed in poster
    if (poster) {
      return poster;
    }

    // best fit width for given video poster handler
    const posters = posterHandler(media);
    if (posters.length) {
      return getBestFitRendition(posters, width).url;
    }

    return "";
  };

  let mediaWidth = 0;
  let graphicRole = "";
  let useAltAsLabel = "";
  let ariaHidden = false;

  $: elementToUse = role === "img" ? "div" : "figure";

  // If it's a graphic, we'll use a label on the g-media container to provide alt text
  // If role was not reset, will give a graphic a role of image
  $: {
    if (
      media?.assetType === "graphic" ||
      media?.assetType === "scoopEmbeddedInteractive"
    ) {
      if (altText) {
        graphicRole = role === "img" ? role : "";
        useAltAsLabel = altText;
      } else {
        ariaHidden = true;
      }
    }
  }

  // If error state, return appropriate error message.
  $: errorMessage = (function (media) {
    const dynamicErrorMessage = [];

    if (typeof media === "string") {
      dynamicErrorMessage.push(
        `The value of the 'media' prop (${media}) should have been auto-processed into a "media middleware" object.`
      );
    } else {
      const validMediaObject =
        !!media?.assetType &&
        !!media?.assetSlug &&
        !!media.mediaComponent &&
        AvailableMediaComponentsSet.has(media.mediaComponent) &&
        Array.isArray(media?.assetErrors) &&
        media.assetErrors.length === 0;

      if (!validMediaObject) {
        // Surface any upstream errors
        if (Array.isArray(media?.assetErrors)) {
          dynamicErrorMessage.push(...media.assetErrors);
        }

        // catch all for invalid media object. resolve.server.js
        // should have picked up most errors.
        if (dynamicErrorMessage.length === 0) {
          dynamicErrorMessage.push(`Unknown 'media' error`);
        }
      }
    }

    // checking for type mismatch
    if (
      media?.assetType &&
      !!expectedType &&
      AssetTypeToExpectedType[media?.assetType] != expectedType
    ) {
      dynamicErrorMessage.push(
        `Expected it to be ${aOrAn(expectedType)} but it is ${aOrAn(media.assetType)}.`
      );
    }

    // if missing assetType but expectedType, there is likely a source file issue
    if (!media?.assetType && !!expectedType) {
      dynamicErrorMessage.push(
        `expectedType passed as "${expectedType}", but that slug or file type appears unable to be rendered by the these supported component/s: ${ExpectedTypeToComponentMapping[
          expectedType
        ].join("")}.`
      );
    }

    // prepend error with more info if possible
    if (dynamicErrorMessage.length && media?.assetSlug) {
      dynamicErrorMessage.unshift(
        `<code>"media:${media.assetSlug}"</code> failed.`
      );
    }

    return dynamicErrorMessage.length ? dynamicErrorMessage.join(" ") : "";
  })(media);
</script>

{#if errorMessage}
  <Error>{@html errorMessage}</Error>
{:else}
  <svelte:element
    this={elementToUse}
    class="g-media"
    class:g-debug={debug}
    bind:clientWidth={mediaWidth}
    role={graphicRole || undefined}
    aria-label={useAltAsLabel || undefined}
    aria-hidden={ariaHidden || undefined}
  >
    {#if debug}<p class="g-media-debug">
        mediaComponent: {media.mediaComponent} | Type: {media.assetType}
      </p>{/if}

    {#if media.mediaComponent === "Graphic"}
      <Graphic html={media?.html} css={media?.css} js={media?.js} />
    {:else if media.mediaComponent === "VideoPlayer"}
      <VideoPlayer
        renditions={media.assetType === "scoopVideo"
          ? getScoopVideoRenditions(
              /**@type {import('./index').ScoopVideoObject} */ (media)
            )
          : media.assetType === "videotape"
            ? getVideotapeRenditions(
                /**@type {import('./index').VideoTapeObject} */ (media)
              )
            : []}
        posters={media.assetType === "scoopVideo"
          ? getScoopVideoPosters(
              /**@type {import('./index').ScoopVideoObject} */ (media)
            )
          : media.assetType === "videotape"
            ? getVideotapePosters(
                /**@type {import('./index').VideoTapeObject} */ (media)
              )
            : []}
        src={media.assetType === "localVideo"
          ? getLocalVideoUrl(
              /**@type {import('./index').LocalVideoObject} */ (media)
            )
          : ""}
        {poster}
        {autoplay}
        {loop}
        {muted}
        {playsinline}
        {preload}
        {altText}
        {controls}
        {ratio}
        {videoPlayerOptions}
      />
    {:else if media.mediaComponent === "Video"}
      <Video
        src={media.assetType === "localVideo"
          ? getLocalVideoUrl(
              /**@type {import('./index').LocalVideoObject} */ (media)
            )
          : getBestFitRendition(
              media.assetType === "scoopVideo"
                ? getScoopVideoRenditions(
                    /**@type {import('./index').ScoopVideoObject } */ (media)
                  )
                : getVideotapeRenditions(
                    /**@type {import('./index').ScoopVideoObject} */ (media)
                  ),
              mediaWidth
            ).url}
        poster={poster || media.assetType === "scoopVideo"
          ? getVideoPoster(getScoopVideoPosters, mediaWidth)
          : getVideoPoster(getVideotapePosters, mediaWidth)}
        {autoplay}
        {controls}
        {loop}
        {muted}
        {playsinline}
        {preload}
        {altText}
      />
    {:else if media.mediaComponent === "VHS"}
      {#if media.assetType === "scoopAudio"}
        <VHS
          src={getScoopAudioUrl(
            /**@type {import('./index').ScoopAudioObject } */ (media)
          )}
          {autoplay}
          {controls}
          {loop}
          {muted}
          vhs_options={vhsOptions}
        />
      {:else}
        <VHS
          src={media.assetSlug}
          {poster}
          {autoplay}
          {controls}
          {loop}
          {muted}
          {ratio}
          {ads}
          vhs_options={vhsOptions}
        />
      {/if}
    {:else if media.mediaComponent === "Image"}
      <Image
        {altText}
        {lazy}
        src={getLocalImageUrl(
          /**@type {import('./index').LocalImageObject } */ (media)
        )}
      />
    {:else if media.mediaComponent === "ImageLoader"}
      <ImageLoader
        {altText}
        {lazy}
        renditions={media.assetType === "scoopImage"
          ? getScoopImageRenditions(
              /**@type {import('./index').ScoopImageObject } */ (media),
              cropName
            )
          : getLocalResponsiveImageRenditions(
              /**@type {import('./index').LocalResponsiveImageObject } */ (
                media
              )
            )}
      />
    {:else if media.assetType === "scoopImage"}
      <ImageLoader
        {altText}
        {lazy}
        renditions={getScoopImageRenditions(
          /**@type {import('./index').ScoopImageObject } */ (media)
        )}
      />
    {:else if media.assetType === "scoopSlideshow"}
      <Slideshow
        {...processScoopSlideshow(
          /**@type {import('./index').ScoopSlideShowObject } */ (media)
        )}
      />
    {:else}
      <Error>No media middleware available for {media.assetType}</Error>
    {/if}
  </svelte:element>
{/if}

<style>
  .g-media-debug {
    position: absolute;
    z-index: 99;
    top: 10px;
    left: 10px;
    color: rgba(255, 0, 0, 0.8);
    background: #000;
    padding: 3px;
    font-family: var(--g-franklin);
  }
</style>
