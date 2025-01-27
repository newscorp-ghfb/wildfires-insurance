<script>
  import { hasJs } from "$lib/stores.js";
</script>

{#if $hasJs}
  <slot />
{:else}
  <noscript>
    <slot />
  </noscript>
{/if}
