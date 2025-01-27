<script>
  export let leadin;
  export let theme;
  export let leftAlign;
  export let layout;
</script>

{#if leadin}
  <p
    class="g-interactive-leadin g-theme-{theme} {layout}"
    class:left-align={leftAlign}
  >
    {@html leadin}
  </p>
{/if}

<style>
  .g-interactive-leadin {
    max-width: var(--g-width-body);
    width: var(--g-width-inset);
    margin: var(--g-margin-inline);
    margin-top: 0;
    color: #333333;
    font-family: var(--g-aileron);
    font-size: 21px;
    font-weight: 300;
    line-height: 26px;
    text-align: center;
  }

  @media (min-width: 640px) {
    .g-interactive-leadin {
      margin-inline: auto;
    }
  }

  @media (min-width: 740px) {
    .g-interactive-leadin {
      width: 720px;
      max-width: 720px;
      font-size: 24px;
      line-height: 30px;
    }
  }

  /* hed layout: left align */
  .g-interactive-leadin.left-align {
    max-width: var(--g-width-body);
    text-align: left;
  }

  /* hed theme: opinion */
  .g-interactive-leadin.g-theme-opinion {
    font: 100 24px/1.15 var(--g-aileron);
    color: #222;
  }

  /* hed theme: extrabold */
  @media (min-width: 740px) {
    .layout-extrabold.g-interactive-leadin {
      max-width: var(--g-width-body);
    }
  }

  /* layout: splitpane */
  .layout-splitpane.g-interactive-leadin {
    max-width: calc(100% - 40px);
  }

  @media (min-width: 740px) {
    .layout-splitpane.g-interactive-leadin {
      color: #fff;
    }
  }

  @media (max-width: 740px) {
    .layout-splitpane.g-interactive-leadin {
      font: 200 22px/1.2 var(--g-aileron);
    }
  }
</style>
