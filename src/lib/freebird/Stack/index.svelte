<script>
  import Wrapper from "$lib/shared/Wrapper/index.svelte";
  import Text from "$lib/shared/Text/index.svelte";
  import Media from "$lib/shared/Media/index.svelte";
  import { archiemlPropsForBreakpoint } from "$lib/shared/utils/breakpoints.js";
  import { windowWidth } from "$lib/stores.js";

  export let props = {};
  $: ({ items, maxWidth } = archiemlPropsForBreakpoint(props, $windowWidth));

  let stackWidth = 0;

  // apply header/footer margin if the viewport width is the same size as the stack,
  // which will prevent the inner-hed/footer text from hitting viewport;
  let headerFooterMarginInline = false;
  $: headerFooterMarginInline = stackWidth + 1 >= Math.round($windowWidth);
</script>

<Wrapper {props} outerWrapper={true}>
  <div class="g-stack" bind:clientWidth={stackWidth}>
    {#each items as item (item)}
      <div class="g-stack_item">
        {#if item.media}
          <div class="g-stack_media">
            <Wrapper
              props={{
                ...item,
                maxWidth:
                  maxWidth /** emulate the top-level wrapper property */,
                marginInline: false,
                headerMarginInline: headerFooterMarginInline,
                footerMarginInline: headerFooterMarginInline,
                marginBlock: "0 25px",
              }}
            >
              <Media props={item} />
            </Wrapper>
          </div>
        {/if}
        {#if item.text}
          <div class="g-stack_text">
            <Text
              text={item.text}
              renderHtml={true}
              generateParagraphs={true}
            />
          </div>
        {/if}
      </div>
    {/each}
  </div>
</Wrapper>
