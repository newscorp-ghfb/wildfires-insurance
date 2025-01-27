<script>
  import BaseWrapper from "$lib/shared/Wrapper/Base.svelte";
  import Media from "$lib/shared/Media/index.svelte";
  import { archiemlPropsForBreakpoint } from "$lib/shared/utils/breakpoints.js";
  import { windowWidth } from "$lib/stores.js";
  // import { WRAPPER_ARIA_LABEL } from '$lib/shared/A11Y/constants';
  // import { AssetTypeToExpectedType } from "$lib/shared/Media/constants";

  /** @type {import("./index").GridItem[]} */
  export let items = [];

  /** @type {number} */
  export let cols = 1;
  // export let altText = "";

  let gridWidth = 0;

  const processGridItems = () => {
    items = items.map((/** @type {import("./index").GridItem} */ item) => {
      let {
        caption,
        source,
        credit,
        note,
        leadin,
        hed,
        label,
        media,
        altText: itemAlt,
        lazy,
        cols,
        rows,
        // Scoop Image
        cropName,
      } = /** @type {import("./index").GridItem}  */ (
        archiemlPropsForBreakpoint(item, $windowWidth)
      );

      const wrapperProps = {
        caption,
        source,
        credit,
        note,
        leadin,
        hed,
        label,
      };

      const mediaProps = { media, altText: itemAlt, lazy, cropName };
      const rowsCols = {
        cols,
        rows,
      };

      return { ...item, wrapperProps, mediaProps, rowsCols };
    });
  };

  $: columns = +cols; //coerce Number if needed

  // apply header/footer margin if the grid is marginInline:false and
  // the viewport width is the same size as the grid, which will
  // prevent the inner-hed/footer text from hitting viewport;
  let headerFooterMarginInline = false;
  $: headerFooterMarginInline = gridWidth + 1 >= Math.round($windowWidth); // add 1 to gridWidth to account for rounding issues in $windowWidth

  // reprocess items as column layouts change or input items change (which can happen on resize)
  $: (columns, items), processGridItems();
  $: cssVars = [`--g-grid-columns: ${columns}`].join(";");
</script>

<figure
  class="g-grid g-grid-cols-{columns} g-grid-length-{items.length}"
  style={cssVars}
  bind:clientWidth={gridWidth}
>
  {#each items as item, i}
    <div
      class="g-grid_item g-grid_item-{i}"
      style="{item.rowsCols.cols
        ? `--g-item-column: ${item.rowsCols.cols}`
        : ''} {item.rowsCols.rows ? `--g-item-row: ${item.rowsCols.rows}` : ''}"
    >
      <BaseWrapper
        {...item.wrapperProps}
        maxWidth={"default"}
        headerMaxWidth={"default"}
        footerMaxWidth={"default"}
        headerMarginInline={headerFooterMarginInline}
        footerMarginInline={headerFooterMarginInline}
        assetType={item.media.assetType}
        marginBlock={false}
        marginInline={false}
      >
        <Media props={item.mediaProps} />
      </BaseWrapper>
    </div>
  {/each}
</figure>

<style>
  .g-grid {
    display: grid;
    grid-template-columns: repeat(var(--g-grid-columns), minmax(0, 1fr));
    grid-gap: 5px;
  }

  .g-grid * {
    box-sizing: border-box;
  }

  .g-grid_item {
    width: 100%;
    grid-column: var(--g-item-column, auto);
    grid-row: var(--g-item-row, auto);
  }
</style>
