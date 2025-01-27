<script>
  import { getBylineAndConnector } from "../utils/bylines.js";
  import ConditionalLink from "../ConditionalLink/index.svelte";
  import Timestamp from "./Timestamp.svelte";

  // export let bylines;
  export let customByline;
  export let layout = "";
  export let leftAlign;
  export let language;
  export let updatedText;
  export let firstPublished;
  export let dateTime;
  export let showTimestamp = true;

  // const prefix = bylines[0]?.prefix;
  // const authors = bylines[0]?.creatorSnapshots || bylines[0]?.creators;

  // const andConnector = getBylineAndConnector(prefix);
</script>

<div class="g-byline-container {layout}" class:left-align={leftAlign}>
  <p id="g-byline" class="g-byline">
    <span class="g-authors">
      <!-- {#if prefix && !customByline}
        <span class="g-byline-prefix">
          {prefix.charAt(0).toUpperCase() + prefix.slice(1)}
        </span>
      {/if} -->

      <!-- svelte whitespace issues: https://github.com/sveltejs/svelte/issues/189 -->
      <!-- prettier-ignore -->
      {#if customByline}
				<span class="g-last-byline">{@html customByline}</span>
			<!-- {:else if authors && authors.length > 0}
				{#each authors as byline, idx}
					{#if authors.length > 1 && idx === authors.length - 1}
						{andConnector}
					{/if}<span class:g-last-byline={idx === authors.length - 1} itemprop="name">
						{#if byline.renderedRepresentation?.value}
							{@html byline.renderedRepresentation.value}
						{:else}
							<ConditionalLink href={byline.bioUrl}>
								{byline.displayName}</ConditionalLink
							>{/if}{#if idx < authors.length - 2},&nbsp{/if}</span
					>
				{/each} -->
			{:else}
				<span class="g-byline-prefix">By</span>
				<span itemprop="name" class="g-last-byline">Barron's</span>
			{/if}
    </span>

    {#if showTimestamp}
      <Timestamp {language} {updatedText} {firstPublished} {dateTime} />
    {/if}
  </p>
</div>

<style>
  .g-byline-container {
    max-width: var(--g-width-body);
    margin: var(--g-margin-inline);
    margin-left: 20px;
    display: flex;
    justify-content: start;
    flex-direction: column;
    text-align: left;
    font-family: var(--g-aileron);
    margin-bottom: 0.75rem;
    color: var(--g-color-graphic-caption);
  }
  @media (min-width: 600px) {
    .g-byline-container {
      margin-left: auto;
      margin-right: auto;
      flex-direction: row;
    }
  }
  @media (min-width: 640px) {
    .g-byline-container {
      margin-left: auto;
      margin-right: auto;
      margin-inline: auto;
    }
  }
  @media (min-width: 740px) {
    .g-byline-container {
      margin-left: auto;
      max-width: 720px;
      text-align: center;
    }
  }
  #g-byline {
    margin: 0 auto;
    text-align: center;
  }
  .g-byline {
    font-weight: 600;
    font-size: 0.875rem;
    line-height: 1.125rem;
    color: var(--g-byline-black);
  }
  @media (min-width: 740px) {
    .g-byline {
      line-height: 1.28;
    }
  }
  #g-byline :global(a) {
    color: var(--g-byline-black);
    text-decoration: underline;
    text-underline-offset: 1px;
    text-decoration-thickness: 1px;
    text-decoration-color: #727272;
  }
  #g-byline :global(a:hover) {
    text-decoration: none;
  }
  .g-last-byline {
    padding-right: 7px;
    display: inline-block;
  }

  /* left align */
  .left-align.g-byline-container {
    margin: var(--g-margin-inline);
    max-width: var(--g-width-body);
  }
  @media (min-width: 640px) {
    .left-align.g-byline-container {
      margin-left: auto;
      margin-right: auto;
      margin-inline: auto;
    }
  }

  .left-align #g-byline {
    margin-left: 0;
    text-align: left;
  }

  /* hed theme: extrabold */
  .layout-extrabold.g-byline-container {
    margin: var(--g-margin-inline);
    margin-bottom: 20px;
    padding-bottom: 30px;
    border-bottom: 1px solid #ccc;
  }

  @media (min-width: 640px) {
    .layout-extrabold.g-byline-container {
      margin-left: auto;
      margin-right: auto;
      margin-inline: auto;
    }
  }

  @media (min-width: 740px) {
    .layout-extrabold.g-byline-container {
      max-width: var(--g-width-body);
    }
  }

  .layout-extrabold .g-authors {
    font-weight: 600;
    opacity: 1;
  }
</style>
