<script>
  export let caption = "";
  export let source = "";
  export let credit = "";
  export let note = "";
</script>

<!-- svelte-ignore a11y-structure -->
<figcaption>
  {#if caption}<p class="g-caption">{caption}</p>
  {/if}

  {#if credit || note || source}
    <p class="g-meta">
      {#if credit}<span class="g-credit">{credit}</span>{/if}
      {#if note}
        <span class="g-note">{note}</span>{/if}
      {#if source}
        <span class="g-source">{source}</span>{/if}
    </p>
  {/if}
</figcaption>

<style>
  figcaption {
    position: absolute;
    top: 0;
    right: 0;
    bottom: 0;
    left: 0;
  }

  .g-caption {
    position: absolute;
    bottom: 30px;
    left: 50%;
    transform: translateX(-50%);

    width: 80%;
    max-width: 1050px;

    font-family: var(--g-body-font-family);
    text-align: center;
    font-size: 2rem;
    line-height: 1.2;
  }

  .g-meta {
    position: absolute;
    bottom: 10px;
    right: 10px;
  }

  .g-credit,
  .g-note,
  .g-source {
    display: inline;
    color: var(--g-color-graphic-credit);
    font-size: 11px;
    line-height: 15px;
  }
</style>
