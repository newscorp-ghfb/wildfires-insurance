<script>
  export let props = {};
  export let theme = "news";

  $: ({ id, className, value } = props);
</script>

<h2 id={id || undefined} class="g-subhed theme-{theme} {className || ''}">
  {@html value}
</h2>

<style>
  h2 {
    font-family: var(--g-aileron);
    margin-inline: var(--g-margin-inline);
    max-width: var(--g-width-body);
    font-weight: 700;
    font-size: 1.438rem;
    line-height: 1;
    margin-top: 2rem;
    margin-bottom: 1rem;
    text-align: center;
  }

  @media (min-width: 640px) {
    h2 {
      margin-left: auto;
      margin-right: auto;
      margin-inline: auto;
    }
  }

  @media (min-width: 740px) {
    h2 {
      font-size: 1.688rem;
      line-height: 1.1;
    }
  }

  @media (min-width: 1024px) {
    h2 {
      font-size: 1.75rem;
      line-height: 1.25;
    }
  }

  /* opinion styles */
  h2.theme-opinion {
    font: 28px/1 var(--g-aileron-cond);
    text-align: center;
  }

  @media (min-width: 740px) {
    h2.theme-opinion {
      font-size: 38px;
    }
  }

  /* oak heading 1 styles */
  .g-heading1block {
    font-weight: 700;
    font-style: italic;
    font-size: 1.9375em;
    line-height: 2.25;
  }

  @media (min-width: 740px) {
    .g-heading1block {
      font-size: 2.5rem;
      line-height: 2.875rem;
    }
  }

  /* oak heading 3 styles */
  .g-heading3block {
    font-family: var(--g-franklin);
    font-size: 1.125rem;
    font-weight: 700;
    line-height: 1.33;
  }

  @media (min-width: 740px) {
    .g-heading3block {
      font-size: 1.25rem;
      line-height: 1.4;
    }
  }

  h2.g-align-left {
    text-align: left;
  }
  h2.g-align-center {
    text-align: center;
  }
</style>
