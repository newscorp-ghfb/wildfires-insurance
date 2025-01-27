<script>
  import {
    widthToStyle,
    marginInlineToStyle,
  } from "$lib/shared/utils/styles.js";

  /** @type {string | number } */
  export let maxWidth = "default";

  /**
   * Boolean or number/string that be used as actual margin-inline value.
   *
   * true: site-wide article gutter value for left and right margin
   * false: no left or right margin.
   * string/number: value converted into valid CSS width
   *
   *  @type {string | boolean | number } *
   */
  export let marginInline = true;

  // generate valid css from marginInline, and margin left/right fallbacks
  $: marginInlineStyle = marginInlineToStyle(marginInline);
  $: marginInlineParts = marginInlineStyle ? marginInlineStyle.split(" ") : [];

  $: cssVars = [
    {
      style: "--g-block_margin-inline",
      value: marginInlineStyle,
    },
    {
      style: "--g-block_margin-left",
      value: marginInlineParts.length ? marginInlineParts[0] : "",
    },
    {
      style: "--g-block_margin-right",
      value: marginInlineParts.length
        ? marginInlineParts.length > 1
          ? marginInlineParts[1]
          : marginInlineParts[0]
        : "",
    },
  ]
    .filter((rule) => rule.value)
    .map((rule) => `${rule.style}:${rule.value}`)
    .join(";");
</script>

<div
  class="g-block g-block-margin"
  class:g-margin-inline={marginInline}
  style={cssVars}
>
  <div
    style:max-width={widthToStyle(maxWidth)}
    class="g-block-width g-max-width-{maxWidth}"
  >
    <slot />
  </div>
</div>

<style>
  .g-margin-inline {
    margin-left: var(--g-block_margin-left, var(--g-margin-left));
    margin-right: var(--g-block_margin-right, var(--g-margin-right));
    @supports (margin-inline: 0) {
      margin-left: auto;
      margin-right: auto;
      margin-inline: var(--g-block_margin-inline, var(--g-margin-inline));
    }
  }

  div.g-block-width {
    margin: auto;
  }

  .g-max-width-body {
    max-width: var(--g-width-body);
  }

  .g-max-width-wide {
    max-width: var(--g-width-wide);
  }
</style>
