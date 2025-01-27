<script>
  import Error from "$lib/shared/Error/index.svelte";
  import Wrapper from "$lib/shared/Wrapper/index.svelte";

  /** @type {string} */
  export let message = "";
  export let stack = "";
</script>

<Wrapper outerWrapper={true}>
  <Error>
    <p>{@html message}</p>
    {#if stack}
      <details>
        <summary>Details</summary>
        <code>{stack}</code>
      </details>
    {/if}
  </Error>
</Wrapper>

<style>
  details {
    margin-top: 1em;
  }

  summary {
    cursor: pointer;
    display: list-item;
    margin-bottom: 0.5em;
  }
</style>
