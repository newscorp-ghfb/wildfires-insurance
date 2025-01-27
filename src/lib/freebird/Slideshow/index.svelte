<script>
  import Wrapper from "$lib/shared/Wrapper/index.svelte";
  import Slideshow from "$lib/shared/Slideshow/index.svelte";
  import { archiemlPropsForBreakpoint } from "$lib/shared/utils/breakpoints.js";
  import { windowWidth } from "$lib/stores.js";

  export let props = {};
  $: ({
    // slideshow props
    items,
    stepper,
    lazy,
    transitionType,
    transitionDuration,
    transitionEasing,
    showButtons,
    autoAdvanceTime,
    stepperTheme,
    stepperClick,
  } = archiemlPropsForBreakpoint(props, $windowWidth));
</script>

<Wrapper
  {props}
  outerWrapper={true}
  element="section"
  ariaLabelType="slideshow"
>
  <Slideshow
    altText={props.altText}
    {items}
    {stepper}
    {lazy}
    {transitionType}
    {transitionDuration}
    {transitionEasing}
    {showButtons}
    autoAdvanceTime={autoAdvanceTime ? +autoAdvanceTime : undefined}
    {stepperTheme}
    {stepperClick}
  />
</Wrapper>
