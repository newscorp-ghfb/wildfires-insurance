<script>
  import { onMount } from "svelte";

  import Wrapper from "$lib/shared/Wrapper/index.svelte";
  import Subhed from "$lib/freebird/Subhed/index.svelte";
  import Media from "$lib/shared/Media/index.svelte";
  import Header from "$lib/freebird/Header/index.svelte";
  import Text from "$lib/shared/Text/index.svelte";
  import Lorem from "$lib/freebird/Lorem/index.svelte";

  import { wayfinder, hasValue } from "./lib.js";

  import "./style.css";

  export let props;

  let ScrollMagic;
  let container;

  let showInset = hasValue(props.inset) ? props.inset : true;

  // boot wayfinder
  onMount(async () => {
    ScrollMagic = (await import("scrollmagic")).default;
    wayfinder(container, props, showInset, ScrollMagic);
  });
</script>

<Wrapper {props} outerWrapper={true}>
  <div class="g-asset-wayfinder" bind:this={container}>
    <div class="g-wayfinder" style="height: 8000px;">
      <div class="g-wayfinder-sticky">
        <div class="g-wayfinder-tiles-container" />
        <div class="g-wayfinder-labels-container">
          <div class="g-wayfinder-labels" />
        </div>

        {#if showInset}
          <div class="g-wayfinder-inset-container">
            <div class="g-wayfinder-inset-cover" />
            <div class="g-wayfinder-inset-area" />
          </div>
        {/if}
      </div>

      <div class="g-wayfinder-scroll-annotations">
        {#each props.slides || [] as slide}
          <div
            class="g-annotation g-wayfinder-scroll-slides {slide.style ||
              ''} {slide.className || ''}"
          >
            <div class="g-wayfinder-slide-container">
              {#if slide.media}
                <Media props={{ media: slide.media }} />
              {/if}
              {#if slide.header}
                <Header props={slide.props} />
              {/if}
              {#if slide.subhed}
                <Subhed props={{ value: slide.subhed }} />
              {/if}
              {#if slide.text}
                <Text text={slide.text} />
              {/if}
              {#if slide.lorem === "" || slide.lorem}
                <Lorem props={slide.props} />
              {/if}
            </div>
          </div>
        {/each}
      </div>
    </div>
  </div>
</Wrapper>
