<script>
  import { onMount } from "svelte";
  import { uniqueId } from "$lib/shared/utils/utilities.js";
  import { getBaseItem } from "$lib/shared/steppers/index.js";
  import Stepper from "$lib/shared/Stepper/index.svelte";
  import BaseWrapper from "$lib/shared/Wrapper/Base.svelte";
  import WrapperCaption from "$lib/shared/Wrapper/WrapperCaption.svelte";
  import Media from "$lib/shared/Media/index.svelte";
  import { archiemlPropsToConfig } from "$lib/shared/utils/breakpoints.js";
  import Buttons from "./buttons.svelte";
  import { windowWidth } from "$lib/stores.js";

  /**
   * Noop for item processing.
   *
   * @param item {import("./index").SlideshowItem}
   * @returns void;
   */
  const itemNoop = (/* eslint-disable */ item /* eslint-enable */) => {};

  /** @type {import("./index").SlideshowItem[]} */
  export let items;

  export let id = uniqueId("g-slideshow_");
  export let stepper = false;
  export let stepperClick = false;
  export let enabled = true;
  export let lazy = true;
  export let autoAdvanceTime = 0; // in milliseconds. 0 to disable.
  export let showButtons = true;
  export let processItem = itemNoop;
  export let onItemActive = itemNoop;
  export let onItemBlur = itemNoop;
  export let transitionType = "fade"; // fade, horizontal. vertical
  export let transitionDuration = 0.5; // seconds
  export let transitionEasing = "ease";
  export let stepperTheme =
    transitionType === "horizontal" ? "standard" : "semiTransparent";
  export let altText = "tk";

  // usually we want to expose to a screenreader all of the slides on a page, but in some cases (like a slideshow)
  // we should hide the slides that are visually hidden. Setting this to true will do that.
  export let hideInactiveSlidesFromScreenReader = false;

  // type of caption to use on each slide
  export let captionComponent = WrapperCaption;
  export let buttonComponent = Buttons;

  // Ensure items have needed props, and run user item processing
  $: items = items.map((item, index) => {
    item = Object.assign({}, getBaseItem(id, index), item);
    item.props = item.props || {};

    // Ensure caption has some value, even if empty string.
    // Stepper Item type specifies optional `text` property.
    // This component prefers 'caption', but falls back to `text or empty string.
    item.caption =
      typeof item.caption === "string"
        ? item.caption
        : item.text
          ? item.text
          : "";

    // if no lazy prop given, default to global
    item.lazy = typeof item.lazy === "boolean" ? item.lazy : lazy;

    // apply user processing
    processItem(item);
    return item;
  });

  export let activeIndex = 0;

  let hasJs = false;

  let transformX = "0px";
  let transformY = "0px";

  let slideshowWidth = 0;

  // bound to element. used to calculate position transforms
  let slideContainerWidth = 0;
  let slideContainerHeight = 0;

  // height set on the container, determined
  // from the height of the contained slides
  let boundHeight = "auto";

  function calculateSlideSize(/** @type  HTMLElement */ node) {
    const slides = node.querySelectorAll(".g-slide");

    const recalculate = () => {
      // calculate after a tick
      setTimeout(function () {
        const sizes = [...slides].map((slide) => slide.getBoundingClientRect());
        if (sizes.length) {
          const maxHeight = Math.max(...sizes.map((s) => s.height));
          boundHeight = `${maxHeight}px`;
        }
      }, 0);
    };

    // recalculate as images load, and when videos load metadata, which includes dimensions
    node.addEventListener("load", recalculate, true);
    node.addEventListener("loadedmetadata", recalculate, true);

    // recalculate on container resize
    const ro = new ResizeObserver(recalculate);
    ro.observe(node);

    return {
      destroy() {
        ro.disconnect();
      },
    };
  }

  const onActiveIndexChange = () => {
    if (enabled && items.length) {
      // reactive update
      items = items.map((item) => {
        const wasActive = !!item.active;
        let isActive = item.index === activeIndex;

        item.active = isActive;

        // recently changed state?
        if (!isActive && wasActive) {
          onItemBlur(item);
          item.previousActive = true;
        } else {
          item.previousActive = false;
        }

        if (isActive && !wasActive) {
          onItemActive(item);
        }

        return item;
      });

      // position g-slides container within the g-slideshow container
      if (transitionType === "horizontal") {
        transformY = "0px";
        transformX = `${Math.round(-1 * (slideContainerWidth * activeIndex))}px`;
      } else if (transitionType === "vertical") {
        transformX = "0px";
        transformY = `${Math.round(-1 * (slideContainerHeight * activeIndex))}px`;
      } else {
        transformX = "0px";
        transformY = "0px";
      }
    }
  };

  $: activeIndex, onActiveIndexChange();
  $: showOverlay = showButtons || stepper;
  $: stepperPosition = transitionType === "horizontal" ? "bottom" : "right";

  // apply header/footer margin if the viewport width is the same size as the slideshow,
  // which will prevent the inner-hed/footer text from hitting viewport;
  let headerFooterMarginInline = false;
  $: headerFooterMarginInline = slideshowWidth + 1 >= Math.round($windowWidth); // add 1 to slideshowWidth to account for rounding issues in $windowWidth

  $: cssVars = [
    `--g-slideshow-boundheight: ${boundHeight}`,
    `--g-slideshow-transition-duration: ${transitionDuration}s`,
    `--g-slideshow-transition-easing: ${transitionEasing}`,
    `--g-slideshow-transform-x: ${transformX}`,
    `--g-slideshow-transform-y: ${transformY}`,
  ].join(";");

  let autoTransitionId;

  onMount(function () {
    hasJs = true;

    // auto transition if time is > 0
    if (autoAdvanceTime) {
      autoTransitionId = setInterval(() => {
        if (activeIndex + 1 < items.length) {
          activeIndex = activeIndex + 1;
        } else {
          activeIndex = 0;
        }
      }, autoAdvanceTime);
    }

    // clean up on destroy
    return () => {
      if (autoTransitionId) {
        clearInterval(autoTransitionId);
      }
    };
  });

  $: role = altText ? "group" : "";
</script>

<div
  class="g-slideshow g-transition-type-{transitionType}"
  class:js={hasJs}
  style={cssVars}
  bind:clientWidth={slideshowWidth}
  role={role || undefined}
  aria-label={altText || undefined}
>
  <div
    class="g-slides"
    use:calculateSlideSize
    bind:clientWidth={slideContainerWidth}
    bind:clientHeight={slideContainerHeight}
    aria-hidden={hideInactiveSlidesFromScreenReader}
  >
    {#each items as item, stackingIndex (item.id)}
      <div
        class="g-slide g-slide-{stackingIndex} g-slide-{item.id} g-slide-type-{item?.media?.mediaComponent?.toLowerCase()}"
        class:g-active={item.index === activeIndex}
        aria-hidden={item.index !== activeIndex}
      >
        <BaseWrapper
          {captionComponent}
          headerMarginInline={headerFooterMarginInline}
          footerMarginInline={headerFooterMarginInline}
          {...archiemlPropsToConfig(item, {
            neededProps: [
              "hed",
              "leadin",
              "caption",
              "source",
              "credit",
              "note",
              "label",
              "maxWidth",
              "headerMaxWidth",
              "footerMaxWidth",
            ],
            propDefaults: {
              maxWidth: "default",
              headerMaxWidth: "body",
              footerMaxWidth: "body",
            },
          })}
          assetType={item?.media?.assetType}
        >
          <Media props={item} />
        </BaseWrapper>
      </div>
    {/each}
  </div>
  {#if showOverlay}
    <div class="g-overlay">
      {#if showButtons}
        <svelte:component
          this={buttonComponent}
          {items}
          bind:index={activeIndex}
        />
      {/if}
      {#if stepper}
        <Stepper
          {items}
          {stepperPosition}
          {stepperTheme}
          {stepperClick}
          bind:index={activeIndex}
        />
      {/if}
    </div>
  {/if}
</div>

<style>
  /** Containers setup */
  .g-slideshow {
    position: relative;
    margin: 0 auto;
    overflow: hidden;
  }

  .g-slides {
    position: relative;
  }

  .g-overlay {
    position: absolute;
    z-index: 2;
    top: 0;
    right: 0;
    bottom: 0;
    left: 0;
  }

  .g-slide {
    width: 100%;
  }

  /** Fading slides setup */

  .js.g-transition-type-fade .g-slides {
    min-height: var(--g-slideshow-boundheight);
  }

  .g-transition-type-fade .g-slide {
    display: none; /* if no js, hide all but first slide, which is default-active and displayed */
  }

  .js.g-transition-type-fade .g-slide {
    position: absolute;
    display: block;
    z-index: 2;
    top: 0;
    opacity: 0;
    transition: opacity var(--g-slideshow-transition-duration)
      var(--g-slideshow-transition-easing);
  }

  .g-transition-type-fade .g-slide.g-active {
    display: block;
    opacity: 1;
    z-index: 1;
  }

  /** Horizontal/Vertical slides setup */
  .g-transition-type-horizontal .g-slides,
  .g-transition-type-vertical .g-slides {
    display: flex;
    flex-wrap: nowrap;
    height: auto;
    max-height: var(--g-slideshow-boundheight);
    transform: translate3d(
      var(--g-slideshow-transform-x),
      var(--g-slideshow-transform-y),
      0
    );
    transition: transform var(--g-slideshow-transition-duration)
      var(--g-slideshow-transition-easing);
  }

  .g-transition-type-horizontal .g-slide,
  .g-transition-type-vertical .g-slide {
    flex-shrink: 0;
  }

  /** Horizontal slide overrides */
  .g-transition-type-horizontal .g-slides {
    flex-direction: row;
  }

  /** Vertical slides overrides */
  .g-transition-type-vertical .g-slides {
    flex-direction: column;
  }
</style>
