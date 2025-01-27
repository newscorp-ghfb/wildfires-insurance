<script>
  export let caption = "";
  export let source = "";
  export let credit = "";
  export let note = "";
  export let textAlign = "left";
</script>

<div class="g-wrapper_caption g-text-align-{textAlign}">
  {#if caption}<p class="g-caption">{@html caption}</p>
  {/if}
  {#if source}<p class="g-source">{@html source}</p>{/if}
  {#if note}<p class="g-note">{@html note}</p>{/if}
  {#if credit}<p class="g-credit">{@html credit}</p>{/if}
</div>

<style>
  .g-wrapper_caption {
    margin: 8px auto auto auto;
    max-width: var(--g-body-max-width);
    font-family: var(--g-franklin);
  }

  .g-wrapper_caption.g-text-align-center {
    text-align: center;
  }

  .g-wrapper_caption.g-text-align-right {
    text-align: right;
  }

  .g-caption {
    display: inline;
    color: var(--g-color-graphic-caption);
    font-weight: 500;
    font-size: 15px;
    line-height: 19px;
    margin-right: 5px;
  }

  .g-credit,
  .g-note,
  .g-source {
    display: inline;
    margin-top: auto;
    color: var(--g-color-graphic-credit);
    font-size: 11px;
    line-height: 13px;
  }

  .g-source:not(:last-child):after,
  .g-note:not(:last-child):after {
    content: "•";
    margin: 0 5px 0 8px;
    font-size: 10px;
    line-height: 1;
    white-space: nowrap;
    font-family: serif;
    color: #ddd;
  }

  .g-wrapper_caption p :global(a) {
    color: inherit;
    text-decoration: underline;
  }

  @media (min-width: 740px) {
    .g-caption {
      font-size: 15px;
      line-height: 20px;
    }

    .g-credit,
    .g-note,
    .g-source {
      font-size: 13px;
      line-height: 17px;
    }
  }

  @media (min-width: 1024px) {
    .g-caption {
      font-size: 16px;
      line-height: 22px;
    }
  }
</style>
