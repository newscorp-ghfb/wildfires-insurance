<script>
  export let hed = "";
  export let leadin = "";
  export let textAlign = "left";
</script>

<div class="g-wrapper_hed g-text-align-{textAlign}">
  {#if hed}
    <h3 class="g-heading" class:g-has-leadin={leadin}>
      {@html hed}
    </h3>
  {/if}
  {#if leadin}<p class="g-leadin">{@html leadin}</p>{/if}
</div>

<style>
  .g-wrapper_hed.g-text-align-center {
    text-align: center;
  }

  .g-wrapper_hed.g-text-align-right {
    text-align: right;
  }

  h3 {
    font-family: var(--g-franklin);
    font-size: 17px;
    line-height: 22px;
    font-weight: 700;
    padding-bottom: 5px;
  }

  p {
    font-family: var(--g-franklin);
    color: var(--g-color-graphic-credit);
    font-size: 15px;
    line-height: 19px;
    padding-bottom: 10px;
  }
</style>
