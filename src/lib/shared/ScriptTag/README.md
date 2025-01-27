# ScriptTag

The `ScriptTag` injects script tags when required for custom components. Even if a component is included multiple times,
or if multiple components share the same dependency, it will only be inserted once. Including code this way is a last
resort, and should be avoided if possible.

## Props

- `src`: The source URL for the script you want to load.
- `inline` (default: `false`): A boolean flag to determine if the script should be inlined within the body. instead of
  included in the `<head>`. Try to avoid using this option.

## Usage

```svelte
<ScriptTag src="https://static01.nyt.com/script.js" />
```
