<script>
  import { afterUpdate } from "svelte";

  export let css;
  export let html;
  export let js;

  let el;

  afterUpdate(() => {
    // For inline interactives with <script> tags, the scripts will
    // run if they are included in the server-rendered HTML.
    // However, they do not run if the interactive is lazy-loaded.
    // This is for browser security 👹.
    // In this case, the browser will render non-script tags as
    // intended, but does not run script tags. Therefore, we need
    // to dynamically append script tags to the DOM to get the
    // scripts to run.
    Array.from(el.querySelectorAll("script")).forEach((oldScriptEl) => {
      const newScriptEl = document.createElement("script");

      Array.from(oldScriptEl.attributes).forEach((attr) => {
        newScriptEl.setAttribute(attr.name, attr.value);
      });

      const scriptText = document.createTextNode(oldScriptEl.innerHTML);
      newScriptEl.appendChild(scriptText);

      oldScriptEl.parentNode.replaceChild(newScriptEl, oldScriptEl);
    });
  });
</script>

<div bind:this={el}>
  {#if css}
    {@html css}
  {/if}
  {@html html}
  {#if js}
    {@html js}
  {/if}
</div>
