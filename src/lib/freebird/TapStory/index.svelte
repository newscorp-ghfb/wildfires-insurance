<script>
  import Wrapper from "$lib/shared/Wrapper/index.svelte";
  import Slideshow from "$lib/shared/Slideshow/index.svelte";
  import { archiemlPropsForBreakpoint } from "$lib/shared/utils/breakpoints.js";
  import { windowWidth } from "$lib/stores.js";
  import TapText from "./TapText.svelte";
  import TapButtons from "./TapButtons.svelte";

  export let props = {};
  $: ({
    // slideshow props
    items,
    stepper,
    lazy,
    transitionType,
    transitionDuration,
    transitionEasing,
    stepperTheme,
  } = archiemlPropsForBreakpoint(props, $windowWidth));

  // transitionType: 'fade'
  let activeIndex = 0;
</script>

<Wrapper {props} outerWrapper={true}>
  <Slideshow
    {activeIndex}
    {items}
    captionComponent={TapText}
    buttonComponent={TapButtons}
    showButtons={true}
    {lazy}
    {transitionType}
    {transitionDuration}
    {transitionEasing}
    {stepper}
    {stepperTheme}
    altText={props.altText}
  />
</Wrapper>
