<script>
  import { onMount, onDestroy, createEventDispatcher } from "svelte";
  import Scroller from "$lib/shared/SvelteScroller/index.svelte";
  import Stepper from "$lib/shared/Stepper/index.svelte";
  import Text from "$lib/shared/Text/index.svelte";
  import ScreenReader from "$lib/shared/A11Y/ScreenReader.svelte";
  import { viewport100vh, windowHeight } from "$lib/stores.js";
  import { uniqueId, debounce, inRange } from "$lib/shared/utils/utilities.js";
  import { heightToStyle, widthToStyle } from "$lib/shared/utils/styles.js";
  import { getBaseItem, sampleItems } from "$lib/shared/steppers/index.js";

  const dispatch = createEventDispatcher();

  /**
   * Noop for item processing. Returns void.
   * @param item {import("./index").ScrollStoryItem}
   */
  /* eslint-disable */
  const itemNoop = (item) => {};
  /* eslint-enable */

  /** @type {import("./index").ScrollStoryItem[]} */
  export let items = sampleItems;

  export let id = uniqueId("g-scrollstory_");
  export let debug = false;
  export let enabled = true;
  export let keyboard = true;
  export let stepper = false;
  export let stepperClick = false;
  export let stepperTheme = "standard"; // standard, semiTransparent
  export let stepperPosition = "right"; // right, left, top, bottom
  export let stepperComponent = Stepper;
  export let threshold = 0.75;
  export let debugColor = "rgba(255, 0, 0, 0.8)";
  export let itemSpacing = "70vh";
  export let textBelow = true;
  export let textStartPosition = "1rem";
  export let textTheme = "standard"; // standard, dark, semiTransparent
  export let onItemActive = itemNoop;
  export let onItemBlur = itemNoop;
  export let processItem = itemNoop;
  export let altText = "tk";
  export let disablePointerEvents = false;

  const isBrowser = typeof window !== "undefined";
  /** @type {HTMLElement | undefined} */
  let el;

  $: items = items.map((item, index) => {
    item = Object.assign({}, getBaseItem(id, index), item);

    // apply user processing
    processItem(item);

    // local CSS var overrides from item props.
    // takes precedent over theme values
    const overrides = [
      {
        rule: "--scrollstory-item-spacing",
        value: heightToStyle(item.itemSpacing || ""),
      },
      {
        rule: "--scrollstory-item-opacity",
        value: inRange(parseFloat(`${item.itemOpacity}` || ""), 0, 1)
          ? `${item.itemOpacity}`
          : "",
      },
      {
        rule: "--g-body-color",
        value: item.itemColor || "",
      },
      {
        rule: "--g-body-background-color",
        value: item.itemBackgroundColor || "",
      },
      {
        rule: "--g-body-padding-top",
        value: heightToStyle(item.itemPaddingTop || ""),
      },
      {
        rule: "--g-body-padding-bottom",
        value: heightToStyle(item.itemPaddingBottom || ""),
      },
      {
        rule: "--g-body-padding-left",
        value: widthToStyle(item.itemPaddingLeft || ""),
      },
      {
        rule: "--g-body-padding-right",
        value: widthToStyle(item.itemPaddingRight || ""),
      },
    ];

    // joined rule:value string for all rules that have a truthy value
    item._style = overrides
      .filter((override) => !!override.value)
      .map((override) => `${override.rule}:${override.value};`)
      .join(" ");

    return item;
  });

  //
  // Bound Scroller vars
  //

  let scrollIndex = 0;
  let activeItemOffset = 0;
  let scrollProgress = 0;
  let scrollCount = 0;
  let visible = false;

  //
  // ScrollStory State
  //

  /** @type {number | undefined} */
  let scrollY;
  let backgroundOffset = { top: 0, left: 0 };
  /** @type {HTMLElement | undefined} */
  let backgroundElement;
  let top = 0;
  let bottom = 0;
  let query = ".scrollstory-item";
  $: fixedState =
    typeof scrollProgress === "number" && scrollProgress <= 0
      ? "pre"
      : typeof scrollProgress === "number" && scrollProgress >= 1
        ? "post"
        : "fixed";

  // Bindable ScrollStory State
  export let backgroundHeight = 0;
  export let backgroundWidth = 0;

  /** @type {number} */
  export let activeIndex = undefined;

  /** @type {import("./index").ScrollStoryItem}*/
  let activeItem =
    typeof activeIndex === "number" ? items[activeIndex] : undefined;

  const textThemeColors = {
    semiTransparent: [
      "--g-body-color: #fff",
      "--g-body-background-color: rgba(71,74,80,1)",
      "--scrollstory-item-opacity: 0.65",
    ],
    dark: ["--g-body-color: #fff", "--g-body-background-color: #121212"],
    standard: ["--g-body-background-color: #fff"],
  };

  $: textComponentCssVars = textThemeColors[textTheme]
    ? [
        `--g-body-padding-top: 0.75rem`,
        `--g-body-padding-bottom: 0.75rem`,
        `--g-body-padding-left: 0.75rem`,
        `--g-body-padding-right: 0.75rem`,
        ...textThemeColors[textTheme],
      ]
    : [];

  $: cssVars = [
    `--scrollstory-threshold-top: ${threshold * 100}vh`,
    `--scrollstory-threshold-left: ${backgroundOffset.left + backgroundWidth}px`,
    `--scrollstory-debug-color: ${enabled ? debugColor : "rgba(255, 0, 0, 0.8)"}`,
    `--scrollstory-debug-transformY: ${threshold * 100 > 80 ? "calc(-100% - 20px)" : "20px"}`,
    `--scrollstory-items-start-auto: ${textBelow && backgroundHeight ? backgroundHeight : 0}px`,
    `--scrollstory-item-spacing: ${heightToStyle(itemSpacing)}`,
    `--scrollstory-text-start: ${textStartPosition}`,
    ...textComponentCssVars,
  ].join(";");

  const isSvelteComponent = (thing) => {
    return thing && isBrowser
      ? typeof thing === "function" // client-side. is there a better check?
      : typeof thing?.render === "function"; // server-side
  };

  //
  // ScrollStory helpers
  //

  /**
   * Return read-only values for internal state.
   */
  export const getState = () => {
    return {
      activeIndex,
      activeItemOffset,
      fixedState,
      scrollCount,
      scrollProgress,
      visible,
      backgroundWidth,
      backgroundHeight,
    };
  };

  /**
   * Return array of items
   */
  export const getItems = () => {
    return items || [];
  };

  /**
   * Return item at given index.
   *
   * @param {number} index
   * @returns {import("./index").ScrollStoryItem } item
   */
  export const getItemByIndex = (index) => {
    if (typeof index !== "number") {
      throw new Error(
        `Expected "index" to be a number, but instead got a ${typeof index}`,
      );
    }
    return getItems()[index];
  };

  /**
   * Check for the existence on item at given index.
   *
   * @param {number} index
   * @returns {boolean}
   */
  export const isValidIndex = (/** @type {number} */ index) => {
    return !!getItemByIndex(index);
  };

  /**
   * Return the exclusively active item or undefined if one isn't active.
   *
   * @returns {import("./index").ScrollStoryItem | undefined } item
   */
  export const getActiveItem = () => {
    return typeof activeIndex === "number"
      ? getItemByIndex(activeIndex)
      : undefined;
  };

  /**
   * Update state and dispatch events on scroll.
   */
  export const enable = () => {
    enabled = true;

    // Recheck current active in case the scrollindex changed while disabled.
    onActiveIndexChange();
  };

  /**
   * Disable state updates and events on scroll.
   */
  export const disable = () => {
    enabled = false;
  };

  const onActiveIndexChange = () => {
    console.log(
      "onActiveIndexChange",
      "scrollindex",
      scrollIndex,
      "activeItemOffset",
      activeItemOffset,
      "activeIndex",
      activeIndex,
    );
    if (enabled && items.length) {
      activeIndex = scrollIndex;

      // reactive update
      items = items.map((item) => {
        const wasActive = !!item.active;
        let isActive = item.index === activeIndex;

        item.active = isActive;

        // recently changed state?
        if (!isActive && wasActive) {
          onItemBlur(item);
          item.previousActive = true;
        } else {
          item.previousActive = false;
        }

        if (isActive && !wasActive) {
          activeItem = item;
          onItemActive(item);
          dispatch("indexchange", { index: activeIndex, item });
        }
        return item;
      });
    }
  };

  const onFixedStateChange = () => {
    dispatch("fixedstatechange", { fixedState: fixedState });
  };

  const onVisibleChange = () => {
    dispatch("visiblechange", { visible: visible });
  };

  /**
   * Lazy loading media may impact DOM dimensions,
   * so force a recalculation as if the window had been resized.
   */
  const onMediaLoad = () => {
    triggerWindowResize();
  };

  const onScrollProgress = () => {
    dispatch("scrollprogress", getState());
  };

  const onActiveItemOffset = () => {
    // keep track of each item progress
    items = items.map((d, idx) => {
      if (idx === activeIndex) {
        d.offset = activeItemOffset;
      }
      return d;
    });

    dispatch("activeitemoffset", { activeItemOffset: activeItemOffset });
  };

  const onResize = () => {
    if (backgroundElement) {
      backgroundHeight = backgroundElement.clientHeight;
      backgroundWidth = backgroundElement.clientWidth;
      // center align when background is available
      if (backgroundHeight) {
        top = ($viewport100vh - backgroundHeight) / 2 / $viewport100vh;
        bottom = 1 - ($viewport100vh - backgroundHeight) / 2 / $viewport100vh;
      } else {
        top = 0;
        bottom = 1;
      }

      // force Scroller to rerun updates, which happens
      // whenever it detects a scroll event
      setTimeout(function () {
        window.dispatchEvent(new Event("scroll"));
      }, 200);
    }
  };

  const triggerWindowResize = debounce(function () {
    if (isBrowser) {
      window.dispatchEvent(new Event("resize"));
    }
  }, 200);

  /**
   * Scroll to the foreground element for the given index.
   * @param index
   */
  export const scrollToIndex = (/** @type {number} */ index) => {
    if ($windowHeight) {
      if (isValidIndex(index)) {
        const itemId = getItemByIndex(index)?.id;
        if (itemId) {
          const itemEl = document.getElementById(itemId);
          if (itemEl) {
            const offsetTop =
              itemEl.getBoundingClientRect().top + window.scrollY + 20; // +20 for wiggle room to ensure trigger
            window.scrollTo({
              behavior: "smooth",
              top: offsetTop - $windowHeight * threshold,
            });
          }
        }
      }
    }
  };

  /**
   * Handle click event on stepper buttons by scrolling to the appropriate foreground item.
   * @param event
   */
  const onStepperClick = (event) => {
    const newIndex = event.target?.dataset?.newindex;
    if (Number.isSafeInteger(parseInt(newIndex))) {
      scrollToIndex(parseInt(newIndex));
    }
  };

  const next = () => {
    const nextIndex = activeIndex + 1;
    if (isValidIndex(nextIndex)) {
      scrollToIndex(nextIndex);
    }
  };

  const previous = () => {
    const previousIndex = activeIndex - 1;
    if (isValidIndex(previousIndex)) {
      scrollToIndex(previousIndex);
    }
  };

  const onKeyDown = (event) => {
    if (keyboard && visible) {
      let captured = true;
      switch (event.keyCode) {
        case 37:
          if (event.metaKey) {
            return;
          } // ignore ctrl/cmd left, as browsers use that to go back in history
          previous();
          break; // left arrow
        case 39:
          next();
          break; // right arrow
        default:
          captured = false;
      }

      if (captured) {
        event.preventDefault();
      }
    }
  };

  // Keep ScrollStory in sync
  $: scrollIndex, onActiveIndexChange();
  $: fixedState, onFixedStateChange();
  $: visible, onVisibleChange();
  $: scrollProgress, onScrollProgress();
  $: activeItemOffset, onActiveItemOffset();

  onMount(function () {
    onResize();

    // Update as image (load) and video (onload) children render in the DOM
    el?.addEventListener("load", onMediaLoad, true);
    el?.addEventListener("loadstart", onMediaLoad, true);

    // force Scroller to rerun updates on load
    // and after the NYT loads, which sometimes
    // takes couple of seconds
    [0, 100, 1000, 2000].forEach((ms) => {
      setTimeout(function () {
        triggerWindowResize();
      }, ms);
    });
  });

  onDestroy(function () {
    el?.removeEventListener("load", onMediaLoad, true);
    el?.removeEventListener("loadstart", onMediaLoad, true);
  });
</script>

<svelte:window on:resize={onResize} on:keydown={onKeyDown} bind:scrollY />

<svelte-scrollstory
  {id}
  bind:this={el}
  class:debug
  class:enabled
  class:stepper
  class:visible
  class:disable-pointer-events={disablePointerEvents}
  class="{enabled && typeof activeIndex === 'number'
    ? `active-index-${activeIndex} active-id-${activeItem?.id}`
    : ''} state-{fixedState}"
  style={cssVars}
>
  <Scroller
    {query}
    {top}
    {bottom}
    {threshold}
    bind:visible
    bind:index={scrollIndex}
    bind:offset={activeItemOffset}
    bind:progress={scrollProgress}
    bind:count={scrollCount}
  >
    <!-- scrollstory Background -->
    <svelte-scrollstory-background
      slot="background"
      bind:this={backgroundElement}
    >
      <slot
        ><p class="scrollstory-fallback">
        </p></slot
      >
      {#if stepper && items.length}
        <svelte:component
          this={stepperComponent}
          {items}
          {stepperTheme}
          {stepperClick}
          {stepperPosition}
          on:click={onStepperClick}
        />
      {/if}
    </svelte-scrollstory-background>
    <!-- // scrollstory Background -->

    <!-- scrollstory Foreground -->
    <svelte-scrollstory-foreground slot="foreground">
      <div
        class="scrollstory-items"
        class:has-custom-foreground={$$slots.foreground}
      >
        {#if altText}
          <ScreenReader>{altText}</ScreenReader>
        {/if}
        <slot name="foreground" {enabled}>
          {#each items as item, i}
            <div
              id={item.id}
              style={item._style}
              class="scrollstory-item scrollstory-item-{i}"
              class:active={enabled && item.active}
            >
              {#if item.markup}
                {@html item.markup}
              {/if}
              {#if isSvelteComponent(item.component)}
                <svelte:component
                  this={item.component}
                  props={item.props || {}}
                  isActive={item.active}
                  {items}
                  {scrollProgress}
                  {activeIndex}
                  {activeItemOffset}
                />
              {/if}
              {#if item.text}
                {#if typeof item.text === "string"}
                  <Text text={item.text} />
                {:else if typeof item.text === "object" && item.text?.value}
                  <Text text={item.text.value} {...item.text} />
                {/if}
              {/if}
              {#if item.altText}
                <ScreenReader>{item.altText}</ScreenReader>
              {/if}
            </div>
          {/each}
        </slot>
      </div>
    </svelte-scrollstory-foreground>
    <!--//  scrollstory Foreground -->
  </Scroller>
</svelte-scrollstory>

{#if debug}
  <div class="scrollstory-debug" style={cssVars}>
    <div class="scrollstory-debug_threshold" style="top: {threshold * 100}vh" />
    <div class="scrollstory-debug_panel" style="">
      <button
        class="scrollstory-debug_close"
        on:click={() => {
          debug = false;
        }}>x</button
      >
      <ul>
        <li>
          ScrollProgress: {typeof scrollProgress === "number" &&
          scrollProgress > 0
            ? scrollProgress.toFixed(3)
            : 0}
        </li>
        <li>
          Active Item Offset: {typeof scrollProgress === "number" &&
          activeItemOffset
            ? activeItemOffset.toFixed(3)
            : 0}
        </li>
        {#if activeItem}
          <li>Active Item Index: {activeIndex}, ID: {activeItem.id}</li>
        {/if}
        <li>Visible: {visible}</li>
        <li>Item Count: {items.length}</li>
        <li>Background: {backgroundWidth}px x {backgroundHeight}px</li>
        <li>Threshold: {threshold}</li>
        <li>Fixed state: {fixedState}</li>
      </ul>
      <button
        class="scrollstory-debug_disable"
        on:click={() => {
          enabled ? disable() : enable();
        }}>{enabled ? "Disable" : "Enable"} scrollstory</button
      >
    </div>
  </div>
{/if}

<style>
  :root {
    --scrollstory-item-opacity: 1;
  }

  svelte-scrollstory * {
    box-sizing: border-box;
  }

  svelte-scrollstory,
  svelte-scrollstory-background,
  svelte-scrollstory-foreground {
    display: block;
    margin: 0;
  }

  svelte-scrollstory-background {
    position: relative;
  }

  svelte-scrollstory-background p.scrollstory-fallback {
    text-align: center;
    font-size: 3rem;
    color: var(--scrollstory-debug-color);
  }

  .scrollstory-items {
    padding-top: var(
      --scrollstory-items-start,
      var(--scrollstory-items-start-auto)
    );
  }

  .scrollstory-items::before {
    display: block;
    content: "";
    width: 100%;
    height: var(--scrollstory-text-start);
  }

  svelte-scrollstory.debug .scrollstory-items::before {
    content: "textStartPosition";
    color: #fff;
    background-color: var(--scrollstory-debug-color);
    opacity: 0.6;
  }

  .scrollstory-item,
  :global(.has-custom-foreground .scrollstory-item) {
    position: relative;
    box-sizing: border-box;
    margin: 0 auto;
    padding-bottom: var(--scrollstory-item-spacing);
    opacity: var(--scrollstory-item-opacity, 1);
  }

  /* block foreground scrolly pointer events so background div can get them */
  :global(.disable-pointer-events svelte-scroller-background),
  :global(.disable-pointer-events svelte-scroller-foreground) {
    pointer-events: none;
  }

  :global(.disable-pointer-events svelte-scrollstory-background) {
    pointer-events: all;
  }

  /* debug */
  .debug .scrollstory-item {
    transition: border-color 0.3s ease;
    border-top: 1px dashed var(--scrollstory-debug-color);
    border-right: 1px dashed var(--scrollstory-debug-color);
    border-bottom: 1px dashed transparent;
    border-left: 1px dashed var(--scrollstory-debug-color);
  }

  svelte-scrollstory.debug .scrollstory-item:last-child {
    border-bottom: 1px dashed var(--scrollstory-debug-color);
  }

  svelte-scrollstory.debug .scrollstory-item.active {
    border-left-style: solid;
    border-right-style: solid;
    border-top-style: solid;
  }

  .scrollstory-debug {
    pointer-events: none;
    position: fixed;
    top: 0;
    bottom: 0;
    left: 0;
    right: 0;
    z-index: 9999;
    color: var(--scrollstory-debug-color);
  }
  .scrollstory-debug_threshold {
    position: absolute;
    left: 0;
    top: 0;
    height: 0px;
    width: 100%;
    border-top: 1px dashed var(--scrollstory-debug-color);
  }

  .scrollstory-debug_threshold:after {
    display: inline-block;
    position: absolute;
    left: var(--scrollstory-threshold-left);
    content: "Threshold";
    color: var(--scrollstory-debug-color);
    font-size: 1rem;
    padding: 10px;
    transform: translate(-100%, 0);
  }
  .scrollstory-debug_panel {
    position: absolute;
    pointer-events: all;
    font-size: 1rem;
    left: 20vw;
    color: #000;
    top: var(--scrollstory-threshold-top);
    left: 20px;
    padding: 18px;
    border: 1px solid var(--scrollstory-debug-color);
    background-color: rgba(255, 255, 255, 0.8);
    transform: translate(0, var(--scrollstory-debug-transformY));
  }

  .scrollstory-debug_panel li {
    line-height: 1.2;
  }

  button.scrollstory-debug_close {
    display: block;
    position: absolute;
    top: 5px;
    right: 5px;
    border-radius: 50%;
    background-color: transparent;
    color: var(--scrollstory-debug-color);
    border: 1px solid var(--scrollstory-debug-color);

    padding: 8px;
    font-family: arial;
    line-height: 7px;
    font-size: 14px;
    text-transform: lowercase;

    transition: transform 0.3s ease;
  }

  button.scrollstory-debug_close:hover {
    transform: rotate(180deg);
  }

  button.scrollstory-debug_disable {
    display: block;
    margin-top: 1rem;
    padding: 8px;
    border: 1px solid black;
    border-radius: 4px;
  }
</style>
