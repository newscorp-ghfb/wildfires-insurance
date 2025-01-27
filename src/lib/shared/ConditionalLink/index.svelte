<script>
  export let href = undefined;
  export let className = undefined;
  export let wrapInDiv = false;
</script>

{#if href}
  <a {href} class={className}>
    <slot />
  </a>
{:else if wrapInDiv}
  <div class={className}>
    <slot />
  </div>
{:else}
  <slot />
{/if}
