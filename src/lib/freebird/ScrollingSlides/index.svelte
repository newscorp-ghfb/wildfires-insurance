<script>
  import Wrapper from "$lib/shared/Wrapper/index.svelte";
  import ScrollStory from "$lib/shared/ScrollStory/index.svelte";
  import Slideshow from "$lib/shared/Slideshow/index.svelte";
  import Header from "$lib/freebird/Header/index.svelte";
  import Fullbleed from "$lib/shared/Fullbleed/index.svelte";
  import { archiemlPropsForBreakpoint } from "$lib/shared/utils/breakpoints.js";
  import { windowWidth } from "$lib/stores.js";

  export let props = {};
  $: ({
    // ScrollingSlide props
    fullHeight,
    fitType,

    // Shared Slideshow/ScrollStory props
    items,
    stepper,

    // ScrollStory props
    debug,
    itemSpacing,
    textBelow,
    textStartPosition,
    textTheme,

    // Slideshow props
    lazy,
    transitionType,
    transitionDuration,
    transitionEasing,
    stepperTheme,
  } = archiemlPropsForBreakpoint(props, $windowWidth));

  let activeIndex = 0;

  // per-item prep
  $: items |
    items.forEach(
      (/**  @type {import('./index').scrollingSlidesItem } */ item) => {
        // Slideshows accept `text` or `caption` props to be backwards
        // compatible with `Stepper` components. It does so preferring `caption` but
        // copying the `text` to `caption` if needed. This leads to ScrollingSlides
        // duplicating scrolling text to image captions. We need to prevent this as
        // ScrollingSlides has separate concepts of `text` and `caption`.
        item.caption = item.caption ? item.caption : "";

        if (item._insertHeader) {
          // ScrollStory, if it finds a component at this prop, will render it,
          // so we can use it to include the Header.
          item.component = Header;
        }
      },
    );

  // To prevent repeating list of props in the multiple SlideShow instances
  $: allSlideshowProps = {
    activeIndex,
    lazy,
    transitionType,
    transitionDuration,
    transitionEasing,
    stepperTheme,
    showButtons: false,
    hideInactiveSlidesFromScreenReader: false,
  };

  // Prevent undefined values from being passed to Slideshow, which override its defaults.
  $: definedSlideshowProps = Object.keys(allSlideshowProps).reduce(
    (acc, currentProp) => {
      if (allSlideshowProps[currentProp] !== undefined) {
        acc[currentProp] = allSlideshowProps[currentProp];
      }
      return acc;
    },
    {},
  );
</script>

<Wrapper
  {props}
  element="section"
  ariaLabelType="scrollingSlides"
  outerWrapper={true}
>
  <ScrollStory
    bind:activeIndex
    {debug}
    {items}
    {stepper}
    {itemSpacing}
    {textBelow}
    {textStartPosition}
    {textTheme}
    altText={props.altText}
  >
    <div class="g-scrollingslides" class:g-fullheight={fullHeight}>
      {#if fullHeight}
        <Fullbleed {fitType}>
          <Slideshow {...definedSlideshowProps} {items} />
        </Fullbleed>
      {:else}
        <Slideshow {...definedSlideshowProps} {items} />
      {/if}
    </div>
  </ScrollStory>
</Wrapper>
