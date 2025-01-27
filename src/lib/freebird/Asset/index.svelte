<script>
  import BaseWrapper from "$lib/shared/Wrapper/Base.svelte";
  import Media from "$lib/shared/Media/index.svelte";
  import { windowWidth } from "$lib/stores.js";
  import { archiemlPropsForBreakpoint } from "$lib/shared/utils/breakpoints.js";

  /**
   * Throw an error if give media is of a type that doesn't match this value, if set.
   * @type {import('../../shared/Media/index').ExpectedType}
   */
  export let expectedType = "";

  /** @type {import("./index").AssetProps} */
  export let props;

  $: ({
    // NOTE: using Base Wrapper instead of default b/c we need to work around some altText behavior below
    id,
    className,
    altText,
    caption,
    source,
    credit,
    note,
    leadin,
    textAlign,
    footerTextAlign,
    headerTextAlign,
    hed,
    label,
    maxWidth,
    headerMaxWidth,
    footerMaxWidth,
    marginInline,
    marginBlock,
    headerMarginInline,
    footerMarginInline,
    // image, video and graphic metadata, used to determine altText
    media,
  } = /** @type {import("./index").AssetProps} */ (
    archiemlPropsForBreakpoint(props, $windowWidth)
  ));

  // For all assets (scoop and non-scoop), a passed in prop for caption, credit
  // or altText, even if empty, will be used. If no prop is passed in, and the asset
  // is from Scoop, the scoop value will be used.
  let localAltText = altText;
  let localCredit = credit;
  let localCaption = caption;

  $: media,
    [
      { name: "altText", value: altText },
      { name: "credit", value: credit },
      { name: "caption", value: caption },
    ].forEach((prop) => {
      if (media?.assetType?.includes("scoop") && prop.value === undefined) {
        // if the prop is missing in the doc, then fall back to the scoop value
        if (prop.name === "altText" && media?.altText)
          localAltText = media.altText;
        if (prop.name === "credit" && media?.credit) {
          localCredit = media.credit;
        }
        if (prop.name === "caption" && media?.caption?.text) {
          localCaption = media?.caption?.text;
        }
      } else {
        // otherwise, use whatever is in the doc
        if (prop.name === "altText") localAltText = prop.value;
        if (prop.name === "credit") localCredit = prop.value;
        if (prop.name === "caption") localCaption = prop.value;
      }
    });

  $: localProps = {
    ...props,
    altText: localAltText,
  };
</script>

<BaseWrapper
  {hed}
  {leadin}
  {textAlign}
  {headerTextAlign}
  {footerTextAlign}
  {source}
  caption={localCaption}
  credit={localCredit}
  {note}
  {maxWidth}
  {headerMaxWidth}
  {footerMaxWidth}
  {marginInline}
  {marginBlock}
  {headerMarginInline}
  {footerMarginInline}
  {label}
  {id}
  {className}
  outerWrapper={true}
  assetType={media?.assetType}
>
  <Media props={localProps} {expectedType} />
</BaseWrapper>
