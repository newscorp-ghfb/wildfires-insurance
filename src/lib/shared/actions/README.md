# Actions

## inView.js

This action triggers a custom event on node entering/exiting the viewport.

### Basic usage

Import the function into your component:

`import inView from '$lib/shared/actions/inView.js';`

On the element you want to observe, add:

```svelte
<p
use:inView
on:enter={() => console.log("enter")}
on:exit={() => console.log("exit")}
>
```

### Usage with additional parameters

```svelte
	<p
use:inView={{ top: 100, bottom: 100, threshold: [0, 0.5, 1] }}
on:enter={() => console.log("enter")}
on:exit={() => console.log("exit")}
>
```

The optional params are: `top`, `bottom`, `root`, `threshold` and `rootMargin`.

#### `top` and `bottom`

Can be passed as `number`, `number + px` or `number + %`. Examples:

- `use:inView={{ bottom: 100 }} // 100 pixels from bottom of viewport`
- `use:inView={{ bottom: '100px' }} // same as above`
- `use:inView={{ bottom: '50%' }} // 50% of the viewport from the bottom of it`

#### `root`, `threshold` and `rootMargin`

Those parameters work the same as in the native IntersectionObserver API:

`threshold` can take decimals or %: `['0%', '25%', '50%, '100%']` works the same as `[0, 0.25, 0.5, 1]`.

`rootMargin` can be passed as an alternative to top and bottom,
but works the same as the native implementation
(no sign flipping or unit validation).

### Accessing `IntersectionObserverEntry` properties

The [full list of properties of an entry](https://developer.mozilla.org/en-US/docs/Web/API/IntersectionObserverEntry) are returned by the `evt.detail` object. Example:

```svelte
<p
use:inView
on:enter={(evt) => (console.log(evt.detail.intersectionRatio))
>
```
