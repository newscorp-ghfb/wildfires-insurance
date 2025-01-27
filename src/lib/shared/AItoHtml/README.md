# Svelte Component: `AItoHtml`

This Svelte component dynamically loads and renders HTML from multiple JSON URLs. It selects and displays specific boards based on the active index and adjusts the display based on the window size.

## Component

### `AItoHtml`
The `AItoHtml` component takes an array of JSON URLs and an active index as props. It fetches data from each URL, selects the appropriate board based on window size, and renders it. If no suitable data exists for the current window size, it displays an alternative message.

**Props:**
- `jsonUrls` (Array of URLs): An array of JSON URLs from which the component fetches the data.
- `activeIndex` (Number): The active index that determines which board to display.

## Usage

Here’s how to use the `AItoHtml` component in your Svelte file:

```svelte
<script>
  import AItoHtml from "$lib/shared/AitoHtml/index.svelte";
  import "./app.css";

  let activeIndex = 0;

  const jsonUrls = [
    "https://www.wsj.com/ai2html/48d0293e-0585-4efb-8bd0-055c29943952/inset.json",
    "https://www.wsj.com/ai2html/f043fa7a-364a-4271-ad2b-ed4c594b6b9b/inset.json",
    "https://www.wsj.com/ai2html/48d0293e-0585-4efb-8bd0-055c29943952/inset.json",
  ];

  function handleIndexChange(event) {
    activeIndex = event.detail.index;
  }
</script>

<div class="container">
  <AItoHtml {jsonUrls} {activeIndex} />
</div>

<style>
  .container {
    position: relative;
    z-index: 1;
  }
</style>
