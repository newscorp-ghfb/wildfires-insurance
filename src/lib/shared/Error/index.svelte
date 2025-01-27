<script>
</script>

<section>
  <slot />
</section>

<style>
  section {
    box-sizing: border-box;
    padding: 1.75em;
    font-family: var(--g-franklin);
    font-weight: 500;
    border: 1px solid #ff0000;
    font-size: 1em;
    line-height: 1.25;
    line-break: loose;
    margin-block: var(--g-margin-block);
    max-width: var(--g-width-body);
    margin-left: auto;
    margin-right: auto;
    color: #ff0000;
  }

  section :global(code) {
    color: dimgrey;
    font-family: Menlo, monospace;
    font-size: 0.9em;
    word-wrap: break-word;
  }
</style>
