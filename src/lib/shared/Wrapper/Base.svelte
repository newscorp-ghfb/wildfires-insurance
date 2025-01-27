<script>
  import WrapperCaption from "$lib/shared/Wrapper/WrapperCaption.svelte";
  import WrapperHed from "$lib/shared/Wrapper/WrapperHed.svelte";
  import Block from "$lib/shared/Block/index.svelte";
  import Label from "$lib/shared/Label/index.svelte";
  // import { WRAPPER_ARIA_LABEL } from '$lib/shared/A11Y/constants';
  import { marginBlockToStyle } from "$lib/shared/utils/styles.js";

  export let hed = "";
  export let leadin = "";

  export let caption = "";
  export let source = "";
  export let credit = "";
  export let note = "";
  export let textAlign = "left";
  export let headerTextAlign = textAlign;
  export let footerTextAlign = textAlign;
  export let label = "";

  export let id = "";
  export let className = "";

  export let maxWidth = "body";
  export let headerMaxWidth = "body";
  export let footerMaxWidth = "body";
  export let keyWidth = "body";
  export let marginInline = false;
  export let headerMarginInline = true;
  export let footerMarginInline = true;
  export let outerWrapper = false; // boolean
  // boolean or number/string that be used as actual value
  export let marginBlock = outerWrapper;

  // allow custom WrapperCaption components to be passed in
  export let captionComponent = WrapperCaption;

  // Allow the use of an element other than 'figure'
  export let element = "figure";
  // export let ariaLabelType = '';
  // export let assetType = '';

  // Only allow block-level elements that comfortably accept
  // additional block level headers, captions and media.
  $: elementToUse = ["figure", "div", "section", "aside"].includes(element)
    ? element
    : "figure";

  // if there is any text associated with the graphic, then
  // the container label with either be hed or "media"
  // $: defaultAriaLabel =
  // 	hed || leadin || caption || source || credit || note
  // 		? ariaLabelType
  // 			? WRAPPER_ARIA_LABEL[ariaLabelType]
  // 			: WRAPPER_ARIA_LABEL[assetType]
  // 		: '';

  // generate valid css from marginBlock, and margin top/bottom fallback
  $: marginBlockStyle = marginBlockToStyle(marginBlock);
  $: marginBlockParts = marginBlockStyle ? marginBlockStyle.split(" ") : [];

  $: cssVars = [
    {
      style: "--g-wrapper_margin-block",
      value: marginBlockStyle,
    },
    {
      style: "--g-wrapper_margin-top",
      value: marginBlockParts.length ? marginBlockParts[0] : "",
    },
    {
      style: "--g-wrapper-margin-bottom",
      value: marginBlockParts.length
        ? marginBlockParts.length > 1
          ? marginBlockParts[1]
          : marginBlockParts[0]
        : "",
    },
  ]
    .filter((rule) => rule.value)
    .map((rule) => `${rule.style}:${rule.value}`)
    .join(";");
</script>

<svelte:element
  this={elementToUse}
  id={id || undefined}
  class="g-wrapper {className}"
  class:g-wrapper-type-outer={outerWrapper}
  class:g-wrapper-type-inner={!outerWrapper}
  class:g-needs-margin-block={marginBlock}
  style={cssVars}
  role={elementToUse === "figure" ? "group" : undefined}
>
  {#if leadin || hed}
    <Block marginInline={headerMarginInline} maxWidth={headerMaxWidth}>
      <WrapperHed {leadin} {hed} textAlign={headerTextAlign} />
    </Block>
  {/if}
  {#if $$slots.key}
    <Block maxWidth={keyWidth}>
      <slot name="key" />
    </Block>
  {/if}
  <Block {maxWidth} {marginInline}>
    {#if label}<Label {label} />{/if}
    <slot />
  </Block>
  {#if caption || source || credit || note}
    <Block marginInline={footerMarginInline} maxWidth={footerMaxWidth}>
      <svelte:component
        this={captionComponent}
        {caption}
        {credit}
        {note}
        {source}
        textAlign={footerTextAlign}
      />
    </Block>
  {/if}
</svelte:element>

<style>
  .g-wrapper {
    max-width: var(--g-width-body);
    margin-left: auto;
    margin-right: auto;
    margin-block: 0;
    --g-wrapper-outer-margin-block: var(
      --g-wrapper_margin-block,
      var(--g-margin-block)
    );
    --g-wrapper-inner-margin-block: 0;
  }

  /** default type is inner and has no margin */
  .g-wrapper-type-inner {
    margin-block: var(--g-wrapper-inner-margin-block);
  }

  /** 
	* outer wrappers by default get this treatment. 
	* if passed a marginBlock value, inner wrapper can also get this treatment. 
	**/
  .g-needs-margin-block {
    /* rough fallback for older browser w/o margin block */
    margin-top: var(--g-wrapper_margin-top, var(--g-margin-top));
    margin-bottom: var(--g-wrapper_margin-bottom, var(--g-margin-bottom));
    @supports (margin-block: 0) {
      margin-top: auto; /* reset */
      margin-bottom: auto; /* reset */
      margin-block: var(--g-wrapper-outer-margin-block);
    }
  }

  .g-wrapper :global(a) {
    color: var(--g-color-anchor);
    text-decoration: underline;
    text-decoration-thickness: 1px;
  }

  .g-wrapper :global(a:hover) {
    text-decoration: none;
  }
</style>
