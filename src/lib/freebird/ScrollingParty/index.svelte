<script>
  import { onMount } from "svelte";

  import Wrapper from "$lib/shared/Wrapper/index.svelte";
  import Subhed from "$lib/freebird/Subhed/index.svelte";
  import ScreenReader from "$lib/shared/A11Y/ScreenReader.svelte";
  import Media from "$lib/shared/Media/index.svelte";
  import Header from "$lib/freebird/Header/index.svelte";
  import Text from "$lib/shared/Text/index.svelte";
  import Lorem from "$lib/freebird/Lorem/index.svelte";

  import scrollingParty from "./scrollingparty.js";
  import "./style.css";

  export let props;

  let ScrollMagic;
  let container;

  // boot scrollingparty
  onMount(async () => {
    ScrollMagic = (await import("scrollmagic")).default;
    scrollingParty(container, props, ScrollMagic);
  });

  const getSlideAlignment = (slide) => {
    if (slide.alignSlide) {
      return `g-align-slides-${slide.alignSlide}`;
    } else if (slide.header) {
      return "g-align-slides-center";
    } else if (props.alignSlides) {
      return `g-align-slides-${props.alignSlides}`;
    }

    return "g-align-slides-left";
  };
</script>

<Wrapper {props}>
  <div
    class="g-asset g-scrollingparty"
    bind:this={container}
    style:--slide-max-width={props.slideMaxWidth}
  >
    <div class="g-asset_inner">
      <div id={props.id} class="g-scrollingparty-container" aria-hidden="true">
        <div class="g-scrollingparty-fallback" />
      </div>

      <div class="g-scrollingparty-annotations">
        {#each props.slides || [] as slide}
          {@const slideAlignment = getSlideAlignment(slide)}
          <div
            class:g-slide-header={slide.header}
            class="g-annotation {slide.classNames || ''} {slideAlignment}"
          >
            <div class="g-annotation-wrap">
              {#if slide.header}
                <Header props={slide.props} />
              {/if}
              {#if slide.subhed}
                <Subhed props={{ value: slide.subhed }} />
              {/if}
              {#if slide.text}
                <Text text={slide.text} />
              {/if}
              {#if slide.media}
                <Media props={{ media: slide.media }} />
              {/if}
              {#if slide.lorem === "" || slide.lorem}
                <Lorem props={slide.props} />
              {/if}
            </div>

            {#if slide.altText}
              <ScreenReader>{slide.altText}</ScreenReader>
            {/if}
          </div>
        {/each}
      </div>
    </div>
  </div>
</Wrapper>

<style>
  .g-annotation-wrap {
    max-width: var(--slide-max-width, 420px);
  }
</style>
