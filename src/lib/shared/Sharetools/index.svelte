<script>
  import { afterUpdate, onMount } from "svelte";

  /** @type {'light-filled' | 'dark-transparent' | 'light-transparent'} */
  export let theme = "light-filled";
  /** @type {boolean} */
  export let dropshadow = false;
  /**
   * Specific buttons can be hidden with the use of this property
   * and separating identifiers with commas, like so: "gift,share,save,comments"
   * */
  export let disable = "";

  let render;

  function remount() {
    setTimeout(() => {
      render = true;
      window.dispatchEvent(new Event("nyt:hydrateInjectableComponents"));
    }, 500);
  }

  onMount(remount);
  afterUpdate(remount);
</script>

<div>
  {#if render}
    <span
      data-place-component="sharetools"
      data-dropshadow={dropshadow || undefined}
      data-theme={theme}
      data-disable={disable}
    />
  {/if}
</div>

<style>
  div {
    min-height: 37px;
  }

  /* Hide sharetools in the app. It's already provided by the shell. */
  :global(.NYTApp) div {
    display: none;
  }
</style>
