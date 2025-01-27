<div class="g-screenreader-only">
  <span class="g-screenreader">
    <slot />
  </span>
</div>

<style>
  .g-screenreader-only {
    position: absolute;
    left: -10000px;
    top: auto;
    width: 1px;
    height: 1px;
    overflow: hidden;
  }
</style>
