<script>
  // import Sharetools from '$lib/shared/Sharetools/index.svelte';
  // import Media from '$lib/shared/Media/index.svelte';

  import Logos from "./Logos.svelte";
  import Bylines from "./Bylines.svelte";
  import Translations from "./Translations.svelte";
  import Leadin from "./Leadin.svelte";

  // export let props;
  export let theme = "news";
  export let headline;
  export let align;
  export let layout;
  export let leadin;
  // export let sharetools;
  export let leadinPosition;
  export let customByline;
  export let hideBylineAndTimestamp = false;
  export let kicker;
  export let translations;
  export let bylines;
  export let language;
  export let updatedText;
  export let firstPublished;
  export let dateTime;

  $: layoutName = layout ? `layout-${layout.toLowerCase()}` : "";
  $: leftAlign = align === "left";

  let kickerText;

  $: {
    if (theme === "opinion") {
      kickerText = "Opinion";
    } else if (kicker) {
      kickerText = kicker;
    } else {
      kickerText = "";
    }
  }
</script>

<div
  class="g-header-container theme-{theme} {layoutName}"
  class:left-align={leftAlign}
>
  <header class="g-header">
    <Logos {theme} layout={layoutName} {leftAlign} />

    {#if kickerText}
      <p class="g-kicker">{kickerText}</p>
    {/if}

    <h1 class="g-heading">{headline}</h1>

    {#if leadin && leadinPosition === "aboveByline"}
      <Leadin {leadin} {theme} {leftAlign} layout={layoutName} />
    {/if}

    {#if layout !== "splitpane" && customByline !== "" && !hideBylineAndTimestamp}
      <Bylines
        layout={layoutName}
        {customByline}
        {leftAlign}
        {bylines}
        {updatedText}
        {language}
        {firstPublished}
        {dateTime}
      />
    {/if}

    {#if leadin && leadinPosition === "belowByline"}
      <Leadin {leadin} {theme} {leftAlign} layout={layoutName} />
    {/if}

    {#if layout !== "splitpane"}
      <Translations {translations} {leftAlign} />
    {/if}

    <!-- {#if sharetools?.show}
			<div class="g-sharetools">
				<Sharetools
					theme={sharetools?.theme}
					dropshadow={sharetools?.dropshadow}
					disable={sharetools?.disable}
				/>
			</div>
		{/if} -->
  </header>

  <!-- {#if layout == 'splitpane'}
		<div class="g-header-image {layoutName}">
			<Media {props} />
		</div>
	{/if} -->
</div>

<style>
  header {
    /* --g-aileron: 'Aileron',helvetica,sans-serif; */
    display: block;
    margin-top: 1.5625rem;
    margin-bottom: 1.375rem;
  }

  @media (min-width: 600px) {
    header {
      margin-top: 45px;
    }
  }
  @media (min-width: 740px) {
    header {
      margin-bottom: 1.5rem;
    }
  }

  .g-heading {
    font-style: normal;
    font-family: Georgia, "Times New Roman", Times, serif;
    font-weight: 500;
    font-size: 2.125rem;
    line-height: 1.1;
    color: var(--g-color-copy);
    text-align: center;
    max-width: var(--g-width-body);
    text-rendering: optimizeLegibility;
    font-feature-settings: "kern";
    -webkit-font-feature-settings: "kern";
    -moz-font-feature-settings: "kern";
    -moz-font-feature-settings: "kern=1";
    margin: var(--g-margin-inline);
    margin-bottom: 0.75rem;
  }

  /* HACK: fix letter spacing issues on chelt at this weight */
  .theme-news .g-heading {
    letter-spacing: -0.02em;
  }

  @media (min-width: 640px) {
    .g-heading {
      margin-left: auto;
      margin-right: auto;
      margin-inline: auto;
    }
  }

  @media (min-width: 740px) {
    .g-heading {
      width: 720px;
      max-width: 720px;
      font-size: 2.375rem;
      line-height: 1.21;
      margin-bottom: 0.75rem;
    }
  }

  @media (min-width: 1024px) {
    .g-heading {
      font-size: 2.9375rem;
      line-height: 1.14;
    }
  }

  .g-sharetools {
    display: flex;
    justify-content: center;
    margin: var(--g-margin-inline);
  }
  @media (min-width: 640px) {
    .g-sharetools {
      margin-left: auto;
      margin-right: auto;
      margin-inline: auto;
    }
  }

  .g-kicker {
    text-align: center;
    margin: 0 auto;
    margin-top: 20px;
    font-size: 0.8125rem;
    font-weight: 700;
    letter-spacing: 0.07em;
    max-width: 720px;
    text-transform: uppercase;
    font-family: var(--g-franklin);
  }

  .g-kicker + .g-heading.g-heading {
    margin-top: 10px;
  }

  /* opinion styles */
  .theme-opinion .g-header {
    margin-left: auto;
    margin-right: auto;
    padding: 0 10px;
    max-width: 700px;
  }

  .theme-opinion .g-kicker {
    font-size: 0.9375rem;
    line-height: 1.5rem;
    color: #d0021b;
    font-family: var(--g-aileron);
  }

  .theme-opinion .g-heading {
    font: 700 2.5rem/2.75rem var(--g-aileron-cond);
    margin-bottom: 10px;
  }

  @media (min-width: 740px) {
    .theme-opinion .g-heading {
      font-size: 3.5625rem;
      line-height: 3.75rem;
    }
  }

  .theme-opinion :global(#g-byline) {
    letter-spacing: 0;
    font: 700 0.8125rem/1.0625rem var(--g-franklin);
  }

  @media (min-width: 740px) {
    .theme-opinion :global(#g-byline) {
      font-size: 1rem;
      line-height: 1.3125rem;
    }
  }

  .theme-opinion :global(time.g-timestamp) {
    font: 500 0.8125rem/1.125rem var(--g-franklin);
    display: block;
    width: 100%;
  }

  /* left align */
  .left-align .g-heading {
    text-align: left;
    max-width: var(--g-width-body);
    margin: var(--g-margin-inline);
    margin-bottom: 0.75rem;
  }

  /* .left-align .g-sharetools {
		max-width: var(--g-width-body);
		justify-content: flex-start;
	} */

  @media (min-width: 640px) {
    .left-align .g-heading {
      margin-left: auto;
      margin-right: auto;
      margin-inline: auto;
    }
  }

  .left-align .g-kicker {
    margin: var(--g-margin-inline);
    margin-bottom: 0;
    max-width: var(--g-width-body);
    text-align: left;
  }

  @media (min-width: 640px) {
    .left-align .g-kicker {
      margin-left: auto;
      margin-right: auto;
      margin-inline: auto;
    }
  }

  /* left align opinion styles */
  .left-align.theme-opinion .g-header {
    padding: 0px;
  }

  .left-align.theme-opinion .g-kicker {
    font-size: 0.9375rem;
  }

  /* hed layout: extrabold */
  .layout-extrabold .g-heading {
    font: 800 34px/35px var(--g-aileron);
    color: rgba(0, 0, 0, 0.85);
    max-width: var(--g-width-body);
    margin: var(--g-margin-inline);
  }

  @media (min-width: 640px) {
    .layout-extrabold .g-heading {
      margin-left: auto;
      margin-right: auto;
      margin-inline: auto;
    }
  }

  @media (min-width: 740px) {
    .layout-extrabold .g-heading {
      font-size: 41px;
      line-height: 45px;
      letter-spacing: -0.025em;
    }
  }

  /* splitpane layout */
  .layout-splitpane :global(img) {
    object-fit: cover;
    width: 100%;
    height: 100%;
  }

  .layout-splitpane :global(picture) {
    height: 100%;
  }

  .layout-splitpane :global(.g-media) {
    height: 100%;
  }

  .layout-splitpane.g-header-container {
    width: 100dvw;
    height: 100dvh;
    display: flex;
    flex-direction: row;
    margin-bottom: 30px;
  }

  .layout-splitpane .g-header {
    width: 50%;
    max-width: 50%;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    padding: 0;
    margin: 0;
    background-color: #000;
  }

  .layout-splitpane .g-kicker {
    color: white;
  }

  .layout-splitpane .g-header h1 {
    max-width: calc(100% - 40px);
    color: #fff;
  }

  .g-header-image.layout-splitpane {
    width: 50%;
    height: 100%;
  }

  @media (max-width: 740px) {
    .layout-splitpane.g-header-container {
      flex-direction: column-reverse;
    }

    .g-header-image {
      max-height: 75dvh;
      width: 100%;
      margin-bottom: 40px;
    }

    .layout-splitpane .g-header {
      width: 100%;
      max-width: 100%;
      background-color: #fff;
    }

    .layout-splitpane .g-kicker {
      margin-top: 0;
    }

    .layout-splitpane .g-header h1 {
      color: #000;
    }
  }
</style>
