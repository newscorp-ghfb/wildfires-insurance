<script>
  import Wrapper from "$lib/shared/Wrapper/index.svelte";
  import { windowWidth, isMobile, isDesktop } from "$lib/stores";
  import { archiemlPropsForBreakpoint } from "$lib/shared/utils/breakpoints.js";

  export let props;

  // Custom props can be accessed like: prop.propName.
  // If you want it to be "responsive", you need to use
  // the archiemlPropsForBreakpoint utility.
  $: ({ myExampleProp } = archiemlPropsForBreakpoint(props, $windowWidth));

  // all data is passed in via arrays:
  // data.body[] and data.sheets[]
  export let data;

  // locally used variable
  let componentWidth = 0;
</script>

<!-- 
	The Wrapper component is the base component for most projects as it 
	defines and standardizes a project/graphic's size and margins, and 
	handles the styling of all the standard metadata props like `hed`, `caption`,
	`etc`. It also creates, as needed, A11Y markup for the `alt` value. 

	The default element for the wrapper is a <figure>, but other block-level 
	elements, like `div` or `section` can be specified via the `element` prop.
-->
<Wrapper {props}>
  <div class="g-example" bind:clientWidth={componentWidth}>
    <ul>
      <li>Component width: {componentWidth}px</li>
      <li>Viewport width: {$windowWidth}px</li>
      <li>isMobile: {$isMobile}</li>
      <li>isDesktop: {$isDesktop}</li>
      <li>myExampleProp: {myExampleProp}</li>
      <li>Available data: {Object.keys(data).join(", ")}</li>
    </ul>
  </div>
</Wrapper>

<style>
  /**
		Generally, most of your styles should go here so that 
		they are scoped to your component and don't impact other 
		page elements or unrelated embeds.

		Common Freebird styles, Freebird overrides of the Vi platform 
		and all shared Freebird CSS vars are available in $lib/*.css.
	*/
  .g-example {
    height: 500px;
    background-color: var(--g-color-loading-background);
  }
  div {
    font-family: var(--g-franklin);
  }
</style>
