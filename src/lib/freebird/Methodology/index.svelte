<script>
  // using BaseWrapper since we don't want to pass through any standard meta,
  // and since a passed in 'hed' here has specific meaning to the methodology.
  import BaseWrapper from "$lib/shared/Wrapper/Base.svelte";
  import { archiemlPropsForBreakpoint } from "$lib/shared/utils/breakpoints.js";
  import { windowWidth } from "$lib/stores.js";
  export let props;

  $: ({ text = [], hed = "Methodology" } = archiemlPropsForBreakpoint(
    props,
    $windowWidth,
  ));
</script>

<BaseWrapper marginInline={true} outerWrapper={true}>
  <div class="g-methodology">
    {#if hed}
      <p class="methodology-hed">{hed}</p>
    {/if}
    {#each text as { type, value }}
      <p>
        {#if type === "text"}
          {@html value}
        {/if}
      </p>
    {/each}
  </div>
</BaseWrapper>

<style>
  .g-methodology:before {
    width: 120px;
    content: "";
    display: inline-block;
    height: 1px;
    margin: 30px 0 20px;
    background-color: black;
  }

  p {
    margin: 0 auto 1.25rem;
    font: 500 0.9375rem/1.25rem var(--g-franklin);
    color: #333;
    margin-bottom: 1.25rem;
  }

  p.methodology-hed {
    font-weight: 800;
  }
</style>
