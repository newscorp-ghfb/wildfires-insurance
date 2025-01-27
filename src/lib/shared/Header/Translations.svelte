<script>
  export let translations, leftAlign;
</script>

{#if translations?.length > 0}
  <div class="g-translations-container" class:left-align={leftAlign}>
    <div class="g-translations">
      {#each translations as translation}
        <a
          href={translation.url}
          title={translation.linkText}
          data-version={translation.language?.code}
        >
          {translation.translatedLinkText || translation.linkText}</a
        >
      {/each}
    </div>
  </div>
{/if}

<style>
  .g-translations-container {
    max-width: 720px;
    margin: 0 auto;
    margin-bottom: 0.75rem;
    text-align: center;
  }

  .g-translations {
    display: flex;
    justify-content: center;
    flex-wrap: wrap;
    gap: 1rem;
    width: auto;
    font-family: var(--g-franklin);
    font-size: 0.875rem;
    line-height: 1.25rem;
    margin: 0 auto 0 auto;
  }

  .g-translations a {
    color: var(--g-color-anchor);
    text-decoration: none;
  }

  /* left align */
  .left-align.g-translations-container {
    margin: var(--g-margin-inline);
    max-width: var(--g-width-body);
  }

  @media (min-width: 640px) {
    .left-align.g-translations-container {
      margin-left: auto;
      margin-right: auto;
      margin-inline: auto;
    }
  }

  .left-align .g-translations {
    justify-content: flex-start;
  }
</style>
