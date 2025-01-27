<script>
  import Wrapper from "$lib/shared/Wrapper/index.svelte";
  import { onMount } from "svelte";

  export let data,
    props = {},
    component; // Provide default values

  props.wrapper = props?.wrapper ?? true;
  let LoadedComponent;

  // Function to dynamically load the component
  const loadComponent = async () => {
    const module = await import(`$lib/project/${component}/index.svelte`);
    LoadedComponent = module.default;
  };

  // Load the component on mount and when component prop changes
  $: loadComponent();
  onMount(loadComponent);
</script>

{#if props.wrapper}
  <Wrapper {props} outerWrapper={true}>
    {#if LoadedComponent}
      <svelte:component this={LoadedComponent} {props} {data} />
    {/if}
  </Wrapper>
{:else if LoadedComponent}
  <svelte:component this={LoadedComponent} {props} {data} />
{/if}
