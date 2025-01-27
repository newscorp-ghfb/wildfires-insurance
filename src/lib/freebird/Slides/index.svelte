<script>
  import ScrollingSlides from "$lib/freebird/ScrollingSlides/index.svelte";
  import Slideshow from "$lib/freebird/Slideshow/index.svelte";
  import TapStory from "$lib/freebird/TapStory/index.svelte";
  import Stack from "$lib/freebird/Stack/index.svelte";
  import { windowWidth } from "$lib/stores";
  import { archiemlPropsForBreakpoint } from "$lib/shared/utils/breakpoints.js";

  export let props;

  /** @type {Object.<string, any>} */
  const compatibleComponents = {
    stack: Stack,
    scrollingslides: ScrollingSlides,
    slideshow: Slideshow,
    tapstory: TapStory,
  };

  // support breakpoint component type selection. default to plain stack
  $: ({ slidesType } = archiemlPropsForBreakpoint(props, $windowWidth));
  $: component =
    compatibleComponents[slidesType?.toLowerCase()] ||
    compatibleComponents["stack"];
</script>

<svelte:component this={component} {props} />
