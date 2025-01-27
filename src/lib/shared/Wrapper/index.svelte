<script>
  import Base from "./Base.svelte";
  import { windowWidth } from "$lib/stores.js";
  import { archiemlPropsForBreakpoint } from "../utils/breakpoints.js";

  /**@type {import('./index').WrapperProps } */
  export let props = {};
  export let element = "figure";
  export let ariaLabelType = "";
  export let outerWrapper = false;

  $: ({
    id,
    className,
    caption,
    source,
    credit,
    note,
    leadin,
    textAlign,
    headerTextAlign,
    footerTextAlign,
    hed,
    label,
    maxWidth,
    headerMaxWidth,
    footerMaxWidth,
    marginInline,
    marginBlock,
    headerMarginInline,
    footerMarginInline,
  } = archiemlPropsForBreakpoint(props, $windowWidth));
</script>

<Base
  {element}
  {hed}
  {leadin}
  {caption}
  {source}
  {credit}
  {note}
  {textAlign}
  {headerTextAlign}
  {footerTextAlign}
  {label}
  {id}
  {className}
  {maxWidth}
  {headerMaxWidth}
  {footerMaxWidth}
  {ariaLabelType}
  {marginInline}
  {marginBlock}
  {headerMarginInline}
  {footerMarginInline}
  {outerWrapper}
>
  <slot />
</Base>
