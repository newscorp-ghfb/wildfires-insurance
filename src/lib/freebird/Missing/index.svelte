<script>
  import Error from "$lib/freebird/Error/index.svelte";
  import Wrapper from "$lib/shared/Wrapper/index.svelte";
  // import { page } from "$app/stores";

  /** @type {string} */
  export let type = "unknown";

  let message = `The ${type} component is missing.`;
</script>

<Wrapper>
  <Error {message} />
</Wrapper>
