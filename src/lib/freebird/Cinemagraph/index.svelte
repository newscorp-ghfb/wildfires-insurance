<script>
  import Asset from "../Asset/index.svelte";

  /** @type {import("../Asset/index").AssetProps} */
  export let props;

  const configuredProps = {
    mediaComponent: "VHS",
    autoplay: true,
    loop: true,
    muted: true,
    controls: false,
    ...props,
  };
</script>

<Asset props={configuredProps} expectedType="video" />
