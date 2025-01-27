<script>
  import { archiemlPropsForBreakpoint } from "$lib/shared/utils/breakpoints.js";
  import { windowWidth } from "$lib/stores.js";

  import Header from "$lib/shared/Header/index.svelte";

  export let props;
  export let theme = "news";

  // may be breakpoint reactive
  $: ({
    align,
    layout,
    leadin,
    sharetools,
    leadinPosition = "aboveByline",
    kicker,
  } = archiemlPropsForBreakpoint(props, $windowWidth));

  // From preprocess-scoop and won't be breakpoint reactive
  const { headline, bylines } = props;
</script>

<Header
  {props}
  {theme}
  {align}
  {layout}
  {leadin}
  {sharetools}
  {leadinPosition}
  {kicker}
  {headline}
  {bylines}
/>
