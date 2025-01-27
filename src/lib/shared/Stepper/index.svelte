<script>
  /** @type {import('../steppers/index').Item[]} */
  export let items;
  export let stepperClick = false;
  export let stepperPosition = "right"; // right, left, top, bottom
  export let stepperTheme = "standard"; // standard, semiTransparent

  const themeStyles = {
    standard: {
      inactive: {
        "background-color": "#c7c7c7",
        border: "1px solid rgba(0, 0, 0, 0.1)",
      },
      active: {
        "background-color": "#121212",
        border: "1px solid rgba(0, 0, 0, 0.1)",
      },
    },
    semiTransparent: {
      inactive: {
        "background-color": "rgba(255, 255, 255, 0.4)",
        border: "1px solid rgba(0, 0, 0, 0.1)",
      },
      active: {
        "background-color": "rgb(255, 255, 255)",
        border: "1px solid rgb(255, 255, 255",
      },
    },
  };

  $: cssVars = ((theme) => {
    /**
     * @type {string[]}
     */
    const rules = [];
    Object.entries(theme).forEach(([status, rulesObj]) => {
      Object.entries(rulesObj).forEach(([cssProp, cssRule]) => {
        rules.push(`--g-stepper-${status}-${cssProp}: ${cssRule}`);
      });
    });
    return rules.join(";");
  })(themeStyles[stepperTheme] || themeStyles["standard"]);
</script>

<div
  class="g-stepper g-position-{stepperPosition} g-theme-{stepperTheme}"
  style={cssVars}
>
  {#each items as item, index}
    {#if stepperClick}
      <button
        class="g-stepper_step"
        class:active={item.active}
        data-newindex={index}
        on:click
      />
    {:else}
      <div class="g-stepper_step" class:active={item.active} />
    {/if}
  {/each}
</div>

<style>
  .g-stepper,
  .g-stepper * {
    box-sizing: border-box;
  }

  .g-stepper {
    display: block;
    position: absolute;
    z-index: 4;
    top: auto;
    right: auto;
    bottom: auto;
    left: auto;
    padding: 0;
    margin: 0px;
  }

  .g-position-right {
    top: 50%;
    transform: translateY(-50%);
    right: 10px;
  }

  .g-position-left {
    top: 50%;
    transform: translateY(-50%);
    left: 10px;
  }

  .g-position-top {
    top: 0%;
    left: 50%;
    transform: translate3d(-50%, 10px, 0);
    display: flex;
  }

  .g-position-bottom {
    bottom: 0%;
    left: 50%;
    transform: translate3d(-50%, 0px, 0);
    display: flex;
  }

  .g-stepper_step {
    display: block;
    width: 8px;
    height: 8px;
    background-color: var(--g-stepper-inactive-background-color);
    border: var(--g-stepper-inactive-border);
    border-radius: 50%;
    padding: 0;

    transition:
      border-color 0.3s ease,
      background-color 0.3s ease;
  }

  .g-position-right .g-stepper_step,
  .g-position-left .g-stepper_step {
    margin: 3px 0;
  }

  .g-position-top .g-stepper_step,
  .g-position-bottom .g-stepper_step {
    margin: 0 3px;
  }

  .g-stepper_step.active {
    background-color: var(--g-stepper-active-background-color);
    border: var(--g-stepper-active-border);
  }
</style>
