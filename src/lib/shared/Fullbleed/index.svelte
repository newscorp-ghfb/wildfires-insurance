<script>
  import { onMount } from "svelte";
  import { viewport100vh, windowWidth } from "$lib/stores.js";
  import { roundToDigits, debounce } from "$lib/shared/utils/utilities";
  import { objectToCss, cover, contain } from "$lib/shared/utils/styles";

  const sizers = {
    cover: cover,
    contain: contain,
  };

  export let fitType = "cover"; // cover or contain
  export let marginTop = 0;
  export let marginRight = 0;
  export let marginBottom = 0;
  export let marginLeft = 0;
  $: combinedTopBottomMargin = marginTop + marginBottom;
  $: combinedLeftRightMargin = marginLeft + marginRight;
  $: sizer = sizers[fitType] || sizers["cover"];

  let style = "";
  let contentWidth;
  let contentHeight;

  // viewport dimensions and ratio
  $: viewportWidth = $windowWidth;
  $: viewportHeight = $viewport100vh;

  // debounce to prevent thrashing
  const updateStyle = debounce(() => {
    // reset styles
    style = objectToCss({
      "--g-fullbleed-target-width": "auto",
      "--g-fullbleed-target-top": `0px`,
      "--g-fullbleed-target-left": `0px`,
      "--g-fullbleed-margin-top": `${roundToDigits(marginTop)}px`,
      "--g-fullbleed-margin-right": `${roundToDigits(marginRight)}px`,
      "--g-fullbleed-margin-bottom": `${roundToDigits(marginBottom)}px`,
      "--g-fullbleed-margin-left": `${roundToDigits(marginLeft)}px`,
      "--g-fullbleed-height": `${roundToDigits(viewportHeight)}px`,
    });

    // tick so DOM has time to reset for better measurements
    setTimeout(() => {
      const { width, height, x, y } = sizer(
        viewportWidth - combinedLeftRightMargin,
        viewportHeight - combinedTopBottomMargin,
        contentWidth,
        contentHeight,
      );
      const targetWidth = `${roundToDigits(width)}px`;
      const targetHeight = `${roundToDigits(height)}px`;
      const targetTop = `${roundToDigits(y)}px`;
      const targetLeft = `${roundToDigits(x)}px`;
      style = objectToCss({
        "--g-fullbleed-target-width": `${targetWidth}`,
        "--g-fullbleed-target-height": `${targetHeight}`,
        "--g-fullbleed-target-top": `${targetTop}`,
        "--g-fullbleed-target-left": `${targetLeft}`,
        "--g-fullbleed-margin-top": `${roundToDigits(marginTop)}px`,
        "--g-fullbleed-margin-right": `${roundToDigits(marginRight)}px`,
        "--g-fullbleed-margin-bottom": `${roundToDigits(marginBottom)}px`,
        "--g-fullbleed-margin-left": `${roundToDigits(marginLeft)}px`,
        "--g-fullbleed-height": `${roundToDigits(viewportHeight)}px`,
      });
      // console.log('***viewportWidth', viewportWidth, 'viewportHeight', viewportHeight, 'contentWidth', contentWidth, 'contentHeight', contentHeight, 'targetWidth', targetWidth, 'targetLeft', targetLeft);
    }, 0);
  }, 1300);

  // keep styles update as viewport changes
  updateStyle();
  $: viewportWidth, viewportHeight | updateStyle();
  onMount(function () {
    updateStyle();
  });
</script>

<div class="g-fullbleed g-fittype-{fitType}" {style}>
  <div class="g-fullbleed_outer">
    <div class="g-fullbleed_inner">
      <div
        class="g-fullbleed_content"
        bind:clientWidth={contentWidth}
        bind:clientHeight={contentHeight}
      >
        <slot />
      </div>
    </div>
  </div>
</div>

<style>
  :root {
    /* overridable css custom properties */
    --g-fullbleed_background-color: transparent;
  }

  .g-fullbleed {
    background-color: var(--g-fullbleed_background-color);
    position: relative;
    height: var(--g-fullbleed-height, 100%);
    overflow: hidden;
  }

  .g-fullbleed_outer {
    position: relative;
    overflow: hidden;
    margin-top: var(--g-fullbleed-margin-top, 0);
    margin-bottom: var(--g-fullbleed-margin-bottom, 0);
    margin-right: var(--g-fullbleed-margin-right, 0);
    margin-left: var(--g-fullbleed-margin-left, 0);
    width: 100%;
    height: var(--g-fullbleed-height, 100vh);
    max-height: calc(
      var(--g-fullbleed-height, 100vh) - var(--g-fullbleed-margin-top) -
        var(--g-fullbleed-margin-bottom)
    );
    max-width: calc(
      100% - var(--g-fullbleed-margin-right) - var(--g-fullbleed-margin-left)
    );
  }

  .g-fullbleed_inner {
    position: absolute;
    overflow: hidden;
    width: var(--g-fullbleed-target-width, 100%);
    height: var(--g-fullbleed-target-height, 100vh);
    top: var(--g-fullbleed-target-top, 0);
    left: var(--g-fullbleed-target-left, 0);
  }
</style>
