<script>
  import Block from "$lib/shared/Block/index.svelte";
  import WrapperHed from "$lib/shared/Wrapper/WrapperHed.svelte";
  import Image from "$lib/shared/Image/index.svelte";
  import { windowWidth } from "$lib/stores.js";
  import { archiemlPropsForBreakpoint } from "$lib/shared/utils/breakpoints.js";

  export let props;

  $: ({ hed, leadin, headerTextAlign, maxWidth, marginInline } =
    /** @type {import("./index").AssetProps} */ (
      archiemlPropsForBreakpoint(props, $windowWidth)
    ));

  const { links, display = "standard" } = props;
  let { hideFields } = props;

  if (display === "compact") hideFields += ", summary";
  const fields = ["headline", "summary", "byline", "date"];
  const displayFields = fields.filter((f) => hideFields.indexOf(f) < 0);
</script>

<Block marginInline={marginInline || true} maxWidth={maxWidth || "body"}>
  <div id="g-related-links" class="display-{display}">
    {#if leadin || hed}
      <div class="g-related-links_header">
        <WrapperHed {leadin} {hed} textAlign={headerTextAlign || "left"} />
      </div>
    {/if}
    <div class="g-related-links_body">
      {#each links as link}
        <div class="g-related-links_item">
          <a href={link.url}>
            {#if display === "standard"}
              {#if link.thumbnail && link.thumbnailDesktop}
                {@const thumb =
                  $windowWidth < 740 ? link.thumbnail : link.thumbnailDesktop}
                <div class="g-related-links_thumb">
                  <Image {...thumb} src={thumb.url} lazy={true} />
                </div>
              {/if}
            {/if}
            <div class="g-related-links_info">
              {#each displayFields as field}
                {#if field === "headline"}
                  <h4 class="g-related-links_item-{field}">{link[field]}</h4>
                {:else if field === "date"}
                  <time class="g-related-links_item-{field}">{link[field]}</time
                  >
                {:else}
                  <p class="g-related-links_item-{field}">{link[field]}</p>
                {/if}
              {/each}
            </div>
          </a>
        </div>
      {/each}
    </div>
  </div>
</Block>

<style>
  #g-related-links {
    border-top: 1px solid var(--g-color-graphic-credit);
    --g-vertical-spacing: 30px;
    padding-top: var(--g-vertical-spacing);
    margin-top: var(--g-vertical-spacing);
    margin-bottom: var(--g-vertical-spacing);
    margin-block: var(--g-vertical-spacing);
  }

  #g-related-links .g-related-links_item a {
    text-decoration: none;
  }

  .g-related-links_header {
    margin-bottom: 10px;
  }

  a:hover .g-related-links_item-headline {
    color: #666;
  }

  .display-compact p {
    display: inline-block;
  }

  .display-compact p:not(:last-child) {
    margin-right: 8px;
  }

  .g-related-links_item + .g-related-links_item {
    margin-top: 1rem;
  }

  .g-related-links_item:not(:last-child) {
    margin-bottom: 1rem;
  }

  .g-related-links_item > a {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
  }

  .g-related-links_thumb {
    margin: 0 10px 0 0;
    width: 75px;
    flex-shrink: 0;
  }

  .g-related-links_info {
    width: 100%;
  }

  .g-related-links_item-headline {
    font-family: var(--g-aileron);
    font-size: 1.125rem;
    line-height: 1.375rem;
    font-weight: 700;
    color: var(--g-color-copy);
  }

  .display-standard .g-related-links_item-headline {
    margin-bottom: 0.4rem;
  }

  .g-related-links_item-summary {
    font-family: var(--g-aileron);
    font-size: 0.9375rem;
    line-height: 1.25rem;
    color: #555;
    margin-bottom: 5px;
  }

  .g-related-links_item-byline,
  .g-related-links_item-date {
    font-family: var(--g-franklin);
    font-weight: 500;
    font-size: 0.75rem;
    line-height: 1.0625rem;
    color: #999;
  }

  @media (min-width: 740px) {
    .g-related-links_thumb {
      width: 30%;
      margin-right: 15px;
      flex-grow: 0;
      flex-shrink: 0;
    }

    .g-related-links_item > a {
      align-items: center;
    }

    .g-related-links_item-headline {
      font-size: 1.1875rem;
      line-height: 1.4375rem;
    }
  }
</style>
