<script>
  import Wrapper from "$lib/shared/Wrapper/index.svelte";
  import Grid from "$lib/shared/Grid/index.svelte";
  import { archiemlPropsForBreakpoint } from "$lib/shared/utils/breakpoints.js";
  import { windowWidth } from "$lib/stores.js";

  export let props = {};
  $: ({ items, cols } = archiemlPropsForBreakpoint(props, $windowWidth));
</script>

<Wrapper {props} ariaLabelType="grid" outerWrapper={true}>
  <Grid {items} {cols} altText={props.altText} />
</Wrapper>
