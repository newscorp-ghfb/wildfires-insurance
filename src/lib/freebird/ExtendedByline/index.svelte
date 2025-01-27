<script>
  import { archiemlPropsForBreakpoint } from "$lib/shared/utils/breakpoints.js";
  import { windowWidth } from "$lib/stores.js";

  import Bylines from "$lib/shared/Header/Bylines.svelte";
  import Timestamp from "$lib/shared/Header/Timestamp.svelte";
  import Sharetools from "$lib/shared/Sharetools/index.svelte";

  export let props;
  export let theme;

  $: ({ sharetools } = archiemlPropsForBreakpoint(props, $windowWidth));
  $: if (sharetools) {
    sharetools.position = sharetools.position ?? "belowByline";
  }
</script>

<div class="g-extended-byline-wrapper">
  {#if sharetools?.show && sharetools.position === "aboveByline"}
    <div class="g-sharetools">
      <Sharetools
        theme={sharetools?.theme}
        dropshadow={sharetools?.dropshadow}
        disable={sharetools?.disable}
      />
    </div>
  {/if}

  <div class="g-extended-byline-container theme-{theme}">
    <Bylines
      layout={props.layoutName}
      customByline={props.customByline}
      bylines={props.bylines}
      updatedText={props.updatedText}
      language={props.language}
      firstPublished={props.firstPublished}
      dateTime={props.dateTime}
      leftAlign={true}
      showTimestamp={false}
    />

    {#if props.bio}
      <p class="g-extended-bio">{@html props.bio}</p>
    {/if}

    <Timestamp
      language={props.language}
      updatedText={props.updatedText}
      firstPublished={props.firstPublished}
      dateTime={props.dateTime}
    />
  </div>

  {#if sharetools?.show && sharetools.position === "belowByline"}
    <div class="g-sharetools">
      <Sharetools
        theme={sharetools?.theme}
        dropshadow={sharetools?.dropshadow}
        disable={sharetools?.disable}
      />
    </div>
  {/if}
</div>

<style>
  /* GENERAL STYLES */
  .g-extended-byline-wrapper {
    max-width: var(--g-width-body);
    margin-inline: var(--g-margin-inline);
    text-align: left;
    font-family: var(--g-franklin);
    color: var(--g-byline-black);
    font-size: 0.9375rem;
    text-align: left;
    margin-bottom: 20px;
  }
  .g-extended-byline-container {
    box-sizing: border-box;
    border-top: 1px solid #e2e2e2;
    padding: 25px 0;
    padding-bottom: 0;
    margin-top: 25px;
  }

  @media (min-width: 640px) {
    .g-extended-byline-wrapper {
      margin-left: auto;
      margin-right: auto;
      margin-inline: auto;
    }
  }

  .g-extended-bio {
    margin-bottom: 0.5rem;
    margin-top: 0.125rem;
    line-height: 1.25rem;
    letter-spacing: 0.01em;
  }

  .g-sharetools {
    display: flex;
    justify-content: flex-start;
    margin-top: 1rem;
  }

  /* ALIGN BYLINE STYLES */
  .g-extended-byline-container :global(.g-byline.g-byline) {
    font-size: 0.9375rem;
  }
  .g-extended-byline-container
    :global(.left-align.g-byline-container.g-byline-container) {
    margin: 0;
    margin-bottom: 0.25rem;
  }

  /* OPINION STYLES */
  .g-extended-byline-container.theme-opinion {
    border-bottom: 1px solid #e2e2e2;
    padding: 10px 0 8px;
  }
</style>
