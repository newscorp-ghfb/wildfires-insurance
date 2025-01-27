<script>
  import IconLoading from "$lib/shared/VideoPlayer/icons/loading.svelte";

  /** @type {boolean} */
  export let active;
</script>

<div class="g-videoplayer_loading" class:active>
  <IconLoading />
</div>

<style>
  .g-videoplayer_loading {
    position: absolute;
    top: 50%;
    left: 50%;
    width: 55px;
    height: 55px;
    transform: translate(-50%, -50%);
    display: none;
    animation: spin 1s infinite;
  }

  .g-videoplayer_loading.active {
    display: block;
  }

  @keyframes spin {
    from {
      transform: translate(-50%, -50%) rotate(0deg);
    }
    to {
      transform: translate(-50%, -50%) rotate(360deg);
    }
  }
</style>
