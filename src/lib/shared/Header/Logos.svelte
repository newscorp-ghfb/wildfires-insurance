<script>
  export let theme, layout, leftAlign;
</script>

{#if theme === "upshot"}
  <div class="logo-wrapper {layout}" class:left-align={leftAlign}>
    <a href="https://www.nytimes.com/section/upshot">
      <img
        src="https://static01.nyt.com/newsgraphics/upshot/upshot-logo.svg"
        alt="Upshot logo"
        width="122"
        height="24"
      />
    </a>
  </div>
{/if}

<style>
  .logo-wrapper {
    display: flex;
    justify-content: center;
    align-items: center;
    margin-bottom: 10px;
  }

  /* left align */
  .left-align {
    max-width: var(--g-width-body);
    margin: var(--g-margin-inline);
    justify-content: flex-start;
  }

  @media (min-width: 640px) {
    .left-align {
      margin-left: auto;
      margin-right: auto;
      margin-inline: auto;
    }
  }

  /* hed layout: extrabold */
  .layout-extrabold {
    margin-bottom: 16px;
  }
</style>
