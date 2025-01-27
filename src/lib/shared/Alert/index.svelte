<script>
  import Text from "$lib/shared/Text/index.svelte";

  export let type;
  export let text;
</script>

<div
  class="g-alert"
  class:g-warning={type === "warning"}
  class:g-refer={type === "refer"}
>
  <Text {text} />
</div>

<style>
  .g-alert {
    border-radius: 3px;
    background-color: #fffcd9;
    padding: 0.75rem 0.9375rem;
    border: 1px rgba(0, 0, 0, 0.1) solid;
    color: rgba(0, 0, 0, 0.65);
  }
  .g-refer {
    background-color: #eee;
  }
  .g-warning {
    background-color: rgba(204, 0, 0, 0.1);
  }
  .g-alert :global(p) {
    font-family: var(--g-franklin);
    font-size: 1.125rem;
    line-height: 1.4;
  }
  .g-alert :global(p:last-of-type) {
    margin-bottom: 0;
  }
</style>
