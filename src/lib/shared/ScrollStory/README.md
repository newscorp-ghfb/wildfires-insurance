# ScrollStory

Your one-stop shop for step-based, scrolling presentations in Freebird.

## TL;DR

```svelte
<script>
  import ScrollStory from "$lib/shared/ScrollStory/index.svelte";

  export let props;
  let { items } = props;
  let activeIndex = 0;
</script>

<ScrollStory bind:activeIndex {items}>
  <p>ScrollStory's activeIndex is {activeIndex}</p>
</ScrollStory>
```

## Overview

We produce a wide variety of scroll-based stories at The New York Times. Some of the styles graduate to formal tooling, like Wayfinder (Birdkit version to come), Scrolling Party (Birdkit version to come) and ScrollStory.

ScrollStory addresses the common pattern of a scroll experience with multiple stacked foreground items, usually text, scrolling over or beside a visual element that updates as the relevant foreground text enters the viewport. Unlike some other techniques where scrolling manipulates a visual element in a linear fashion with the scroll position (see: Scrolling Party, Wayfinder, etc), ScrollStory triggers `focus` -- or exclusive active state -- for a single foreground block of text and its corresponding background state.

### Examples:

- [Study of Elite College Admissions Data Suggests Being Very Rich Is Its Own Qualification](https://www.nytimes.com/interactive/2023/07/24/upshot/ivy-league-elite-college-admissions.html) (Updating a LayerCake graphic.)

- [See How the G.O.P. Has Reacted to the Trump Indictment](https://www.nytimes.com/interactive/2023/06/16/us/republican-trump-indictment-response.html) (Updating a grid/small multiples graphic.)

- [Why the U.S. Electric Grid Isn’t Ready for the Energy Transition](https://www.nytimes.com/interactive/2023/06/12/climate/us-electric-grid-energy-transition.html) (Desktop only: Stack of ai2html, via ScrollingSlides.)

- [Extreme Heat Will Change Us](https://www.nytimes.com/interactive/2022/11/18/world/middleeast/extreme-heat.html) (Custom scrolling video slideshows with data.)

- [Noise Could Take Years Off Your Life. Here’s How](https://www.nytimes.com/interactive/2023/06/09/health/noise-exposure-health-impacts.html) (Stack of ai2html, via ScrollingSlides, and LayerCake graphics.)

Note the strong one-to-relationship between foreground text and background media in each of these examples. The text speaks directly to the visual, not dissimilar to how a caption speaks to a photo in a photo story. (See `stepstory` [types and overview](../steppers/README.md)).

### Reader Experience Considerations

Best practice dictates that for this opinionated style of scrollytelling we have some foreground text always visible as we progress through a ScrollStory. The text serves as visual feedback to readers, reminding them that 1) they're in control and the interactive is working, and 2) that changes come at a predictable trigger point, keeping them oriented. Not all scrolling experience need foreground text to do this, but most do need visual feedback that serves this function. See: ["How To Scroll"](https://bost.ocks.org/mike/scroll/) by Mike Bostock. Particularly bullet 3: "When implementing custom scrolling, provide feedback by having at least some visible content scroll normally at all times.")

### On Terminology and Existing Tools

There are a plethora of in-house and external tools commonly used in our scrolling projects with similar names, leading to some confusion. This is compounded by the fact that some Freebird Classic tools and functionality have evolved into Birdkit Freebird, sometimes with differing names or functionality.

- `ScrollStory`: Now an in-house Svelte component pre-configured for use with Birdkit Freebird, it was originally an an open source [jQuery plugin](https://sjwilliams.github.io/scrollstory/) we developed for Classic Freebird for use in stand-alone projects, and as the scrolling API behind ScrollingSlides and ScrollingGraphic.
- `svelte-scroller`: Rich Harris's [svelte-scroller](https://github.com/sveltejs/svelte-scroller) is an easy-to-use component that encapsulates many of the step-based scrolling ideas in the original ScrollStory, but does so in a modern, reactive fashion and with minimal code. It is commonly used in custom scrolling projects in the newsroom. It also serves as the backbone for new `ScrollStory`, which imports a [local copy](../SvelteScroller/index.svelte) and adds Freebird-aware configuration options on top of it.
- `ScrollingSlides`: Available in both Classic and Birdkit Freebird, this is pre-configured scrolling slideshow. In Birdkit, the [scrolling slideshows](../../freebird/ScrollingSlides/README.md) support -- via the [Slideshow component](../Slideshow/README.md) -- images, ai2html, html fragments and has rudimentary [support for videos](https://github.com/newsdev/birdkit/issues/405).
- `ScrollingGraphic`: In Freebird Classic, the functionality now encapsulated in Birdkit ScrollStory was most analogous to [ScrollingGraphic](https://library.nyt.net/graphics/preview/vi-freebird/vi-freebird-scrollinggraphic).

## To Use

Before using, see if [ScrollingSlides](../../freebird/ScrollingSlides/README.md), our scrolling photo/video/ai2html slideshow template will do what you need. It's also built on ScrollStory, so its source may beneficial as a reference.

### Example Project

The "ScrollStory Examples" [project on Runway](https://runway.nyt.net/preview/2023-08-03-scrollstory-demo/main/index) and the [code in GitHub](https://github.com/nytnews-projects/2023-08-03-scrollstory-demo) expands on the ideas documented below.

![image](https://github.com/newsdev/birdkit/assets/294614/353fe3ba-4a02-4c75-a661-c6acc9da10c4)

### Most Basic Use

In its most basic form, ScrollStory expects to receive an array of `item` objects with your foreground `item.text` and exports an `activeIndex` that you use to reactively update the state of your background graphic. Your graphic goes into ScrollStory's [slot](https://svelte.dev/tutorial/slots).

```svelte
<script>
  import ScrollStory from "$lib/shared/ScrollStory/index.svelte";

  export let props;
  let { items } = props;
  let activeIndex = 0;
</script>

<ScrollStory bind:activeIndex {items}>
  <p>ScrollStory's activeIndex is {activeIndex}</p>
</ScrollStory>
```

See example: [lib/project/BasicScrollStory/index.svelte](https://github.com/nytnews-projects/2023-08-03-scrollstory-demo/blob/main/src/lib/project/BasicScrollStory/index.svelte)

### ScrollStory Global Options

| prop                 | type      | default                | description                                                                                                                                         |
| -------------------- | --------- | ---------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------- |
| id                   | string    | (autogenerated)        | A unique dom ID to assign to container element. If blank, an auto-generated ID will be assigned.                                                    |
| enabled              | boolean   | true                   | Enabled ScrollStory updates. Useful to temporarily disable in DOM updates might inadvertently trigger updates.                                      |
| keyboard             | boolean   | true                   | When enabled, left and right keyboard events progress the experience backwards and forwards.                                                        |
| stepper              | boolean   | false                  | UI element to visualize progress through scroll experience.                                                                                         |
| stepperClick         | boolean   | false                  | When true, dots become clickable to page auto-scrolls to the correct item.                                                                          |
| stepperTheme         | string    | 'standard'             | 'standard' or 'semiTransparent' adjust the color of the stepper dots.                                                                               |
| stepperPosition      | string    | 'right'                | 'right', 'left', 'top' or 'bottom'                                                                                                                  |
| stepperComponent     | component | Stepper                | For advance uses, you can pass in a custom component to replace the stepper UI.                                                                     |
| threshold            | number    | 0.75                   | 0-1, defines percentage from viewport top to trigger new item focus. See `svelte-scroller` [for more](https://github.com/sveltejs/svelte-scroller/) |
| textTheme            | string    | 'standard'             | Built-in foreground and background text color themes: 'standard', 'dark', 'semiTransparent' or 'none'.                                              |
| textBelow            | boolean   | true                   | If text should start below main art. If false, it aligns to the top of the ScrollStory container.                                                   |
| textStartPosition    | string    | '1rem'                 | Used in conjunction with `textBelow`, distance, in CSS height units, to push the start of the foreground text elements down.                        |
| itemSpacing          | string    | '70vh'                 | Spacing below items, in CSS height units. Used to separate current item from the next.                                                              |
| debug                | boolean   | false                  | Enable debug mode. Visualizes internal state and element borders.                                                                                   |
| debugColor           | string    | 'rgba(255, 0, 0, 0.8)' | Adjust the color of debug UI.                                                                                                                       |
| onItemActive         | function  | noop                   | Callback on event (see `Events` below for alternate method)                                                                                         |
| onItemBlur           | function  | noop                   | Callback on event (see `Events` below for alternate method)                                                                                         |
| processItem          | function  | noop                   | Callback on event (see `Events` below for alternate method)                                                                                         |
| altText              | string    | ''                     | Screen reader text for the entire scroll experience.                                                                                                |
| disablePointerEvents | boolean   | false                  | Disable foreground pointer events (ie: copy text) so background graphic can capture and use click/touch events.                                     |

If you are using ScrollStory within a custom Svelte component, and would like to override the default global options, you must manually pass each custom global option, such as `stepper` or `textBelow`, from your Google Doc to the component:

```svelte
<script>
  import ScrollStory from "$lib/shared/ScrollStory/index.svelte";
  export let props;
  let { items, textBelow, stepper } = props;
  let activeIndex = 0;
</script>

<ScrollStory bind:activeIndex {items} {textBelow} {stepper}>
  <p>This is the background of my custom component</p>
</ScrollStory>
```

### Exported properties

Binding to the following properties provides basic state information for use in your graphic. (see `Events` below for alternate method and additional state details).

- activeIndex
- backgroundHeight
- backgroundWidth

See example: [lib/project/BasicScrollStory/index.svelte](https://github.com/nytnews-projects/2023-08-03-scrollstory-demo/blob/main/src/lib/project/BasicScrollStory/index.svelte)

### Item Object Properties

| prop                | type                        | default         | description                                                                                                                                                               |
| ------------------- | --------------------------- | --------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| id                  | string                      | (autogenerated) | A globally unique dom ID assigned to foreground `item` container. If blank, an auto-generated ID will be assigned based on global `id` documented above.                  |
| text                | string / ArchieMLTextObject | ''              | Text to render inside a foreground scrolling `item` paragraph. Can also be an Text component compatible object like {value: 'my text', className: 'my-class', id: 'myId'} |
| markup              | string                      | ''              | Pre-generated markup to render in foreground scrolling `item`.                                                                                                            |
| component           | svelte component            | undefined       | Component to render in foreground scrolling `item`.                                                                                                                       |
| altText             | string                      | ''              | Alternative text to apply to this specific item's foreground.                                                                                                             |
| itemSpacing         | string                      | ''              | Per-item override to global value.                                                                                                                                        |
| itemOpacity         | string                      | ''              | Per-item foreground opacity. Overrides values, where applicable, from global `textTheme`.                                                                                 |
| itemColor           | string                      | ''              | Per-item foreground text color. Overrides values, where applicable, from global `textTheme`.                                                                              |
| itemBackgroundColor | string                      | ''              | Per-item foreground text background color. Overrides values, where applicable, from global `textTheme`.                                                                   |
| itemPaddingTop      | string                      | ''              | Per-item foreground text padding. Overrides values, where applicable, from global `textTheme`.                                                                            |
| itemPaddingBottom   | string                      | ''              | Per-item foreground text padding. Overrides values, where applicable, from global `textTheme`.                                                                            |
| itemPaddingLeft     | string                      | ''              | Per-item foreground text padding. Overrides values, where applicable, from global `textTheme`.                                                                            |
| itemPaddingRight    | string                      | ''              | Per-item foreground text padding. Overrides values, where applicable, from global `textTheme`.                                                                            |

## Events

`ScrollStory` dispatches events for the following:

| eventName        | event.detail               | description                                                                                                                                                                                                       |
| ---------------- | -------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| fixedstatechange | {fixedState: 'fixed'}      | On fixed state change. See `fixedState` below.                                                                                                                                                                    |
| visiblechange    | { visible: true }          | On foreground visibility change. See `visible` below.                                                                                                                                                             |
| indexchange      | { index: 2, item }         | When a new `item` becomes active, return it and its internal index number.                                                                                                                                        |
| activeitemoffset | { activeItemOffset: 0.33 } | Percent scroll complete. See `activeIemOffset` below.                                                                                                                                                             |
| scrollprogress   | `getState()`               | Returns the current state of all tracked properties: `activeIndex`, `activeItemOffset`, `fixedState`, `scrollCount`, `scrollProgress`, `visible`, `backgroundWidth`, `backgroundHeight`. See: `getState()` below. |

You handle events in usual Svelte fashion:

```svelte
<script>
  import ScrollStory from "$lib/shared/ScrollStory/index.svelte";
  export let props;
  let { items } = props;

  let scrollProgress = 0;

  const onScroll = (event) => {
    const state = event.detail;
    scrollProgress = state.scrollProgress;
  };
</script>

<ScrollStory on:scrollprogress={onScroll}>
  <p>Current scroll progress: {scrollProgress}</p>
</ScrollStory>
```

See [/lib/project/State/index.svelte](https://github.com/nytnews-projects/2023-08-03-scrollstory-demo/blob/main/src/lib/project/State/index.svelte)

## Instance Methods

`ScrollStory` exports a handful of utilities, which you can access from the component instance.

```svelte
<script>
  import ScrollStory from "$lib/shared/ScrollStory/index.svelte";
  export let props;
  let { items } = props;

  // instance
  let myScrollStory;
</script>

<ScrollStory
  bind:this={myScrollStory}
  on:scrollprogress={() => {
    console.log(myScrollStory.getState());
  }}
>
  <!-- Your graphic -->
</ScrollStory>
```

| method name            | returns                | description                                                          |
| ---------------------- | ---------------------- | -------------------------------------------------------------------- |
| getActiveItem()        | itemObject / undefined | Return the exclusively active item or undefined if one isn't active. |
| getItemByIndex(number) | itemObject             | Return item at given index. You may want to wrap with `isValidIndex` |
| isValidIndex(number)   | boolean                | Check for the existence on item at given index.                      |
| enable()               | void                   | Update state and dispatch events on scroll.                          |
| disable()              | void                   | Disable state updates and events on scroll.                          |
| scrollToIndex(number)  | void                   | Scroll to the foreground element for the given index                 |
| getState               | stateObject            | Return read-only values for internal state.                          |

### State/getState() Properties

`getState()` return the same properties as individual events documented above.

| property name    | type    | description                                                                                                                                                      |
| ---------------- | ------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| activeIndex      | number  | Zero-based index for the exclusively active `item`                                                                                                               |
| activeItemOffset | number  | 0-1 percent representation of the active items' scroll progress past the `threshold`.                                                                            |
| fixedState       | string  | fixed, pre or post. The background graphic is in state fixed while stationary, but can be pre or post when it's scrolling in position static.                    |
| scrollCount      | number  | The number of items, which have a foreground scrolly block and a background state.                                                                               |
| scrollProgress   | number  | How far the foreground has traveled, where 0 is the top of the foreground crossing the top of viewport, and 1 is the bottom crossing the bottom of the viewport. |
| visible          | boolean | Whether or not any part of the ScrollStory container is in the viewport.                                                                                         |
| backgroundWidth  | number  | Width of the background.                                                                                                                                         |
| backgroundHeight | number  | Height of the background.                                                                                                                                        |

See [/lib/project/State/index.svelte](https://github.com/nytnews-projects/2023-08-03-scrollstory-demo/blob/main/src/lib/project/State/index.svelte)
