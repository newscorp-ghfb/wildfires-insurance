<script>
  import { onMount } from "svelte";

  /** @type string */
  export let src;
  export let lazy = false;
  export let altText = "";

  /** @type {(string | number | null | undefined)} */
  export let width = "";

  /** @type {(string | number | null | undefined)} */
  export let height = "";

  // bindable state
  export let loaded = false;

  // use native lazy loading?
  /** @type {('lazy' | 'eager' | null | undefined)} */
  let loading = lazy ? "lazy" : "eager";

  // configurable image element class name
  export let className = "g-image";

  let hasJs = false;

  /** @type HTMLImageElement */
  let img;

  const imageLoaded = () => {
    loaded = true;
  };

  onMount(() => {
    hasJs = true;
    if (img && img.complete && img.naturalHeight !== 0) {
      imageLoaded();
    } else {
      img.onload = imageLoaded;
    }
  });
</script>

<img
  alt={altText}
  {loading}
  decoding="async"
  {width}
  {height}
  {src}
  class={className}
  class:js={hasJs}
  class:nojs={!hasJs}
  class:loaded
  bind:this={img}
/>

<style>
  img {
    display: block;
    width: 100%;
    opacity: 0;
    transition: opacity 300ms ease-out;
  }

  /* fade in on load when js is enabled. with no js, always show */
  img.nojs,
  img.loaded {
    opacity: 1;
  }
</style>
