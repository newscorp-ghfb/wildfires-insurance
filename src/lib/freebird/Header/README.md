# Header

A complete replacement of the platform header. It should work well without passing any options but it supports advanced customization, including Oak-like cover presentations, custom bylines and complete control over the sharetools.

If you are working in a custom component and need to pass your own data you should use the shared version. You can pass all the core presentation values individually, including headline, published date and authors.

```svelte
<script>
  import Header from "$lib/shared/Header/index.svelte";

  const headline = "My custom headline";
  const firstPublished = "2023-09-29T15:36:31.246Z";

  const bylines = [
    {
      prefix: "By",
      creatorSnapshots: [
        {
          displayName: "Sarah Almukhtar",
          bioUrl: "https://www.stg.nytimes.com/by/sarah-almukhtar",
        },
      ],
    },
  ];
</script>

<Header {headline} {bylines} {firstPublished} />
```

### Google doc props

These are the props you need to pass from the `pages` section of the doc that affect the core header values.

| Property             | Type                | Description                                                                                                                                                                                           | Default | Example                                                                                                        |
| -------------------- | ------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------- | -------------------------------------------------------------------------------------------------------------- |
| **headline.default** | _[Required] String_ | Headline of the article.                                                                                                                                                                              | `empty` | `Mapping Where Floods Have Devastated a Libyan Port City`                                                      |
| **leadin**           | _[Optional] String_ | Leadin of the article. You can control whether this appears below or above the byline with the `leadinPosition` option in the main header props.                                                      | `empty` | `Temperatures around the world this month have been at their highest levels in decades for this time of year.` |
| **theme**            | _[Optional] String_ | This can change the typeface or adds section logos. It is being used by different sections to adjust the whole article at once with their styles. Possible values are `news`, `upshot` and `opinion`. | `news`  | `opinion`                                                                                                      |
| **updatedText**      | _[Optional] String_ | Formatted date of the last update to the piece. This is rendered in red as is meant for breaking news. It prepends `Updated` automatically before the text.                                           | `empty` | `Aug. 14`                                                                                                      |

These are the props you can pass to the `{.header}` block. They affect mostly presentational values.

| Property                   | Type                 | Description                                                                                                                                                                                                                                                                                                                                                                                          | Default        | Example                                                                       |
| -------------------------- | -------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------- | ----------------------------------------------------------------------------- |
| **align**                  | _[Optional] String_  | Aligns the header to one side. Right now you can only pass `left`.                                                                                                                                                                                                                                                                                                                                   | `empty`        | `left`                                                                        |
| **customByline**           | _[Optional] String_  | Adds a custom byline that bypasses Scoop. It supports html too. You can pass an empty string to hide the byline completely. Use this feature with care.                                                                                                                                                                                                                                              | `undefined`    | `By <a href="https://www.nytimes.com/by/sarah-almukhtar">Sarah Almukhtar</a>` |
| **hideBylineAndTimestamp** | _[Optional] Boolean_ | Controls whether the byline and timestamp are hidden. This is added automatically if you add an `extendedbyline` component in your doc.                                                                                                                                                                                                                                                              | `false`        | `true`                                                                        |
| **kicker**                 | _[Optional] String_  | Adds a kicker above the headline.                                                                                                                                                                                                                                                                                                                                                                    | `empty`        | `Uncharted waters`                                                            |
| **layout**                 | _[Optional] String_  | Controls the layout, possible values are `splitpane`, which splits the header half and half between the headline and a cover image (used in Opinion and Magazine pieces), `cover`, a full width, Oak-like presentation with the headline inset in the image (typical in stories coming from Oak) and `extrabold`, which bolds the headline even more and adds a ruler below (used in Upshot pieces). | `empty`        | `cover`                                                                       |
| **leadinPosition**         | _[Optional] String_  | Controls if the leadin is positioned above or below the byline, possible values are `aboveByline` and `belowByline`.                                                                                                                                                                                                                                                                                 | `belowByline`  | `aboveByline`                                                                 |
| **media**                  | _[Optional] String_  | Pass a media id to render an image or a video in the header. This is only enabled if you use the `splitpane` layout. This works using the media component so it can be a Scoop id, a custom url or a local file.                                                                                                                                                                                     | `empty`        | `100000007122900`                                                             |
| **sharetools.show**        | _[Optional] Boolean_ | Controls whether sharetools appear in the component.                                                                                                                                                                                                                                                                                                                                                 | `false`        | `true`                                                                        |
| **sharetools.theme**       | _[Optional] String_  | Controls the sharetools theme. Possible values are `light-filled`, `dark-transparent` and `light-transparent`.                                                                                                                                                                                                                                                                                       | `light-filled` | `light-transparent`                                                           |
| **sharetools.dropshadow**  | _[Optional] Boolean_ | Adds a drop shadow to the sharetools. Not really encouraged.                                                                                                                                                                                                                                                                                                                                         | `false`        | `true`                                                                        |
| **sharetools.disable**     | _[Optional] String_  | Disable individual buttons in the sharetools by passing a comma separated list of components. Possible values are `gift`, `share`, `save` and `comments`.                                                                                                                                                                                                                                            | `empty`        | `gift,comments`                                                               |

### Core props

These are the props with the raw article data. Some comes from Scoop, others come from the doc. You only work with these if you use the shared component.

As an example, this is the [GraphQL query](https://go.nyt.net/AKj6a892TzuIW14T0ruKdw) we use to fetch from Scoop.

| Property           | Type                | Description                                                                                            | Default          | Example                                                    |
| ------------------ | ------------------- | ------------------------------------------------------------------------------------------------------ | ---------------- | ---------------------------------------------------------- |
| **bylines**        | _[Optional] Object_ | Byline of the piece. This uses an object in the same format that Scoop uses.                           | `undefined`      | https://go.nyt.net/SlLmFtL2SCucUWveeQ2rrw                  |
| **dateTime**       | _[Required] String_ | Timestamp of first publish of the piece in E.T. timezone.                                              | `empty`          | `2023-09-29T15:36:31.246Z`                                 |
| **firstPublished** | _[Required] String_ | Formatted date of first publish of the piece in E.T. timezone.                                         | `empty`          | `Sept. 9, 2023`                                            |
| **headline**       | _[Required] String_ | The headline of the piece.                                                                             | `empty`          | `Mapping Where Floods Have Devastated a Libyan Port City`  |
| **language**       | _[Optional] Object_ | An object that holds the language code of the piece.                                                   | `{ code: 'en' }` | `{ code: 'es' }`                                           |
| **translations**   | _[Optional] Object_ | An object that holds renditions of the piece in different languages.                                   | `undefined`      | https://go.nyt.net/JqbCNsegTC6mAFYxoA2yXQ                  |
| **updatedText**    | _[Optional] String_ | Formatted date of the last update to the piece. This is rendered in red as is meant for breaking news. | `empty`          | `Updated Aug. 14`                                          |
