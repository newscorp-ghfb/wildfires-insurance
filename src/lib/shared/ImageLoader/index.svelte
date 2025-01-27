<script>
  import { onMount } from "svelte";
  import Image from "$lib/shared/Image/index.svelte";
  import Error from "$lib/shared/Error/index.svelte";
  import {
    generateRenditionMediaQueries,
    getCurrentAspectRatio,
  } from "./imageLoaderUtils.js";
  import { windowWidth } from "$lib/stores.js";

  /**  @type {import('./types').ImageRenditions } */
  export let renditions = [];
  export let lazy = true;
  export let altText = "tk";

  let loaded = false;
  let hasJs = false;

  // Calculate per-rendition aspect ratios and srcset media queries.
  $: processedRenditions = generateRenditionMediaQueries(renditions);

  // Fallback rendition in cases of no <picture> support
  $: defaultRendition = processedRenditions[0];

  /**
   * To reduce page re-renders as images load, we attempt to set
   * the aspect ratio for the <picture> element dynamically
   * to help the browser pre-size the image height. With regular
   * local, responsive images, where all rendition are the same ratio,
   * we could just grab one and bake it into the markup.
   *  But Scoop images may have different ratios for desktop and mobile.
   * In these cases, we default to 'auto' and update as possible
   * when/if JS loads. See util for additional details.
   */
  let aspectRatio = getCurrentAspectRatio(processedRenditions); // ssg
  $: (aspectRatio = getCurrentAspectRatio(processedRenditions)),
    $windowWidth,
    hasJs; // csr

  onMount(() => {
    hasJs = true;
  });
</script>

{#if defaultRendition}
  <picture class:loaded style="--g-picture-ratio: {aspectRatio}">
    {#if processedRenditions.length > 1}
      {#each processedRenditions as rendition}
        <source media={rendition.mediaQuery} srcset={rendition.srcSetUrl} />
      {/each}
    {/if}
    <Image
      src={defaultRendition.url}
      bind:loaded
      {altText}
      {lazy}
      width={defaultRendition.width}
      height={defaultRendition.height}
    />
  </picture>
{:else}
  <Error>
    No default image rendition found. Check that your <code>renditions[]</code>
    is correct, and if using Scoop Images you're using a <code>cropName</code> that
    exist in Scoop.
  </Error>
{/if}

<style>
  picture {
    position: relative;
    display: block;
    width: 100%;
    background-color: var(--g-color-loading-background);
    aspect-ratio: var(--g-image-loader-aspect-ratio, var(--g-picture-ratio));
  }
</style>
