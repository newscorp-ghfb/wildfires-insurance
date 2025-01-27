<script>
  import Asset from "../Asset/index.svelte";

  /** @type {import("../Asset/index").AssetProps} */
  export let props;
</script>

<Asset {props} expectedType="video" />
