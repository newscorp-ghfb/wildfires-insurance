<script>
  import BaseWrapper from "$lib/shared/Wrapper/Base.svelte";
  import Alert from "$lib/shared/Alert/index.svelte";
  import { archiemlPropsForBreakpoint } from "$lib/shared/utils/breakpoints.js";
  import { windowWidth } from "$lib/stores.js";

  export let props;

  $: ({ type, text, marginInline, marginBlock } = archiemlPropsForBreakpoint(
    props,
    $windowWidth,
  ));
</script>

<BaseWrapper
  outerWrapper={true}
  marginInline={marginInline || true}
  marginBlock={marginBlock || true}
  {...props}
>
  <Alert {type} {text} />
</BaseWrapper>
