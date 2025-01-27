# Wrapper

The Wrapper component standardizes much of the look of our in-article graphics and visuals. It manages widths and margins, and the styling of standard metadata props like `hed`, `caption`, `credit`, etc. It also creates, as needed, A11Y markup.

The component is meant to be used as the base of most other Freebird templates and custom projects. It is not a stand-alone template.

## In Use

In its most common form, the `Wrapper` looks like this:

```svelte
<script>
  import Wrapper from "$lib/shared/Wrapper/index.svelte";
  export let props = {};
</script>

<Wrapper {props} outerWrapper={true}>
  <p>Your Graphic in the slot.</p>
</Wrapper>
```

This does two important things:

- The `Wrapper` wraps your content in, by default, a Figure element and matches its width and left/right margin to other in-article assets. If you set `outerWrapper` to `true`, your graphic gets the same top and bottom margin as other top-level templates.
- The optional passing of the standard `props` object, which is the object version of all the properties in your corresponding ArchieML Google Doc, enables the use of the standard `hed`, `caption`, `credit`, etc props (detailed below). Additionally, those properties are automatically breakpoint responsive props, so `hed` and `hed-desktop`, for example, will return the correct value at the given viewport width.

### Preview

![image](https://github.com/newsdev/birdkit/assets/294614/0361c51f-8300-4c23-9cee-82d7ae830a75)

#### Markup

And generates, by default, a Figure element and basic ARIA labels.
![image](https://github.com/newsdev/birdkit/assets/294614/e3a0a483-33a3-4bef-9625-390b1a0ba6f4)

## Component Props

When implementing in a custom project, the `Wrapper` optionally accepts three props:

```svelte
<Wrapper {props} element={"div"} ariaLabelType={"media grid"}>
  <p>My Graphic</p>
</Wrapper>
```

| prop          | type    | default  | description                                                                                                                    |
| ------------- | ------- | -------- | ------------------------------------------------------------------------------------------------------------------------------ |
| props         | object  | {}       | Container for all possible Google Doc options.                                                                                 |
| element       | string  | 'figure' | Type of element to use for outer most container with `g-wrapper` class applied. One of `figure`, `div`, `section`, or `aside`. |
| outerWrapper  | boolean | false    | Outer wrappers get a top and bottom margin that match other in-article assets.                                                 |
| ariaLabelType | string  | ""       | Type of ARIA label to use. See [Aria Constants](../A11Y/constants.ts) for common ones, like "image" and "scrolling gallery".   |

## Google Doc Props (props.\*)

The following are automatically extracted from the props object and available to any component using the `Wrapper`.

| prop               | type            | default                | description                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                |
| ------------------ | --------------- | ---------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| id                 | string          | ""                     | Optional unique DOM id for containing `g-wrapper`.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         |
| className          | string          | ""                     | Optional class name for containing `g-wrapper`.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            |
| hed                | string          | ""                     | Optional headline above media.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             |
| caption            | string          | ""                     | Optional caption below media.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              |
| source             | string          | ""                     | Optional source line below media.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          |
| credit             | string          | ""                     | Optional credit line below media.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          |
| note               | string          | ""                     | Optional credit line below media.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          |
| leadin             | string          | ""                     | Optional leadin text between `hed` and media.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              |
| note               | string          | ""                     | Optional note line below media.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            |
| label              | string          | ""                     | Optional label over media.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 |
| textAlign          | string          | "left"                 | Align all media header and footer copy: "left", "center" or "right".                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       |
| headerTextAlign    | string          | value of `textAlign`   | Align media header copy independently. Same options as `textAlign`.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        |
| footerTextAlign    | string          | value of `textAlign`   | Align media footer copy independently. Same options as `textAlign`.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        |
| maxWidth           | string          | 'body'                 | maxWidth of media. 'body' (600px), 'wide' (1050px)and 'full' (100%) are the named, preferred presets. Also `maxWidth-720px` style pixel values will work.                                                                                                                                                                                                                                                                                                                                                                                                                                  |
| headerMaxWidth     | string          | 'body'                 | maxWidth of header copy. Same options as `maxWidth`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        |
| footerMaxWidth     | string          | 'body'                 | maxWidth of footer copy. Same options as `maxWidth`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        |
| marginInline       | boolean, string | false                  | Control left and right _content_ margins. If false, no left or right margins. If truthy (`true` or a valid CSS width), apply a left and/or right margin around main _visual content_ (`media`, or your custom component code). `true` results in the standard article gutter width, but you can also be specify values in px or other units. Like the CSS [margin-inline](https://developer.mozilla.org/en-US/docs/Web/CSS/margin-inline) rule, you can specify a single value for both left and right, or individual values. Examples: `20px 10px`, or `5vw`.                             |
| headerMarginInline | boolean, string | true                   | Control left and right _header_ margins. If false, no left or right margins. If truthy (`true` or a valid CSS width), apply a left and/or right margin around main _header_ (headline, leadin, etc). `true` results in the standard article gutter width, but you can also be specify values in px or other units. Like the CSS [margin-inline](https://developer.mozilla.org/en-US/docs/Web/CSS/margin-inline) rule, you can specify a single value for both left and right, or individual values. Examples: `20px 10px`, or `5vw`.                                                       |
| footerMarginInline | boolean, string | true                   | Control left and right _footer_ margins. If false, no left or right margins. If truthy (`true` or a valid CSS width), apply a left and/or right margin around main _header_ (headline, leadin, etc). `true` results in the standard article gutter width, but you can also be specify values in px or other units. Like the CSS [margin-inline](https://developer.mozilla.org/en-US/docs/Web/CSS/margin-inline) rule, you can specify a single value for both left and right, or individual values. Examples: `20px 10px`, or `5vw`.                                                       |
| marginBlock        | boolean, string | same as `outerWrapper` | Control top and bottom margins around entire Wrapper. If false, no top or bottom margins. If truthy (`true` or a valid CSS height) apply a top and/or bottom margin around the Wrapper. `true` results in the standard in-article margins above and below Wrapper (see `--g-margin-top/bottom` in variables.css), but you can also be specify values in px or other units. Like the CSS [margin-block](https://developer.mozilla.org/en-US/docs/Web/CSS/margin-block) rule, you can specify a single value for both top and bottom, or individual values. Examples: `20px 10px`, or `5vh`. |

## Style Props

TK

## Component Architecture

The passing of the `props` object straight through to `$lib/shared/Wrapper/index.svelte`, like in the examples above, allows component developers to quickly reuse common elements and default styles without needing to know all the available `Wrapper` props. This is facilitated by splitting the component into two pieces:

- `$lib/shared/Wrapper/index.svelte`: This is an ArchieML-aware component that extracts all supported properties from the Google Doc derived `props` object and checks to see if they have viewport responsive variants (ie: `maxWidth` and `maxWidth-desktop`). If any responsive variants exist, it determines which value to use based on viewport width. Finally, it passes just the expected props and resolved props to the `$lib/shared/Wrapper/Base.svelte` component.

- `$lib/shared/Wrapper/Base.svelte`, This is the lower level component that does the heavy lifting. It has no awareness of Google Doc ArchieML or ability to resolve viewport responsive props. It simply exports all the props listed above without any `props.*` nesting. See `$lib/shared/Grid/index.svelte` for an example of how and when to use it directly.

We use this split pattern for similar reasons in the oft-paired `$lib/shared/Media` component.
