# Fullbleed

Need to stretch your graphic, photo or video to the full-extent of the viewport? This component resizes slot container content to dynamically fill the full height and width of the viewport. There are two supported styles: `cover` (default) and `contain`. `cover` completely covers the viewport and likely crops some of the media. `contain` stretches the media as large as possible without cropping, likely with whitespace on two of the sides. Think of this as a subset of CSS image's `object-fit: cover` and `object-fit:contain` for any content.

## In Use

```svelte
<script>
  import Fullbleed from "$lib/shared/Fullbleed/index.svelte";
</script>

<Fullbleed>
  <div>
    <p>My Fullbleed Graphic</p>
  </div>
</Fullbleed>

<style>
  div {
    background-color: teal;
    display: flex;
    align-items: center;
    justify-content: center;
    aspect-ratio: 16/9;
    width: 100%;
  }

  p {
    font-size: 3rem;
    text-align: center;
  }
</style>
```

## Example Project

[Runway Demo](https://runway.nyt.net/preview/2023-08-25-fullbleed-demo/main/index)

## Options

| prop         | type   | default | description                                                                                    |
| ------------ | ------ | ------- | ---------------------------------------------------------------------------------------------- |
| fitType      | string | 'cover' | 'cover' or 'contain'. Used to defined how slot content is sized.                               |
| marginTop    | number | 0       | Margin in pixels to apply whitespace between top of the content and top of the viewport.       |
| marginBottom | number | 0       | Margin in pixels to apply whitespace between bottom of the content and bottom of the viewport. |
| marginLeft   | number | 0       | Margin in pixels to apply whitespace between left of the content and left of the viewport.     |
| marginRight  | number | 0       | Margin in pixels to apply whitespace between right of the content and right of the viewport.   |
