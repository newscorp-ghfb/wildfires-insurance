<script>
  export let label = "";
  /** @type {''|'top-right' | 'top-left' | 'top-left' | 'bottom-left' | 'bottom-right' | 'top-center' | 'bottom-center'} */
  export let position = "";
  /** @type {''|'black-on-white'}*/
  export let theme = "";
</script>

<p class="g-label g-position-{position} g-theme-{theme}">{@html label}</p>

<style>
  .g-label {
    position: absolute;
    font-weight: 500;
    font-family: var(--g-franklin);
    margin-bottom: 0;
    color: #ffffff;
    background-color: rgba(0, 0, 0, 0.6);
    text-align: center;
    z-index: 100;
    font-size: 0.938rem;
    line-height: 0.938rem;
    padding: 0.7rem 0.8rem;
  }

  .g-label.g-theme-black-on-white {
    color: var(--g-body-color);
    background-color: rgba(255, 255, 255, 0.6);
  }

  .g-label.g-position-top-right {
    top: 0;
    right: 0;
    bottom: auto;
    left: auto;
  }

  .g-label.g-position-top-left {
    top: 0;
    right: auto;
    bottom: auto;
    left: 0;
  }

  .g-label.g-position-top-left {
    top: 0;
    right: auto;
    bottom: auto;
    left: 0;
  }

  .g-label.g-position-bottom-left {
    top: auto;
    right: auto;
    bottom: 0;
    left: 0;
  }

  .g-label.g-position-bottom-right {
    top: auto;
    right: 0;
    bottom: 0;
    left: auto;
  }

  .g-label.g-position-top-center {
    top: 0;
    right: auto;
    bottom: auto;
    left: 50%;
    transform: translateX(-50%);
  }

  .g-label.g-position-bottom-center {
    top: auto;
    right: auto;
    bottom: 0;
    left: 50%;
    transform: translateX(-50%);
  }
</style>
