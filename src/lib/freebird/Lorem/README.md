# Lorem

The `Lorem` component is designed to generate random placeholder text in the form of words, sentences, and
paragraphs.

## Props

- `words`: Specifies the number of words in a sentence
- `sentences`: Specifies the number of sentences in a paragraph.
- `paragraphs`: Specifies the number of paragraphs or a range. (default: `1`)
- `lede`: A custom introductory text to be added to the beginning of the generated content.

## Usage ArchieML

```ArchieML
{.lorem}
    lede: Five words
    words: 5
{}

{.lorem}
    lede: Two sentences.
    sentences: 2
{}

{.lorem}
    lede: 1-3 paragraphs
    paragraphs: 1-3
{}

{.lorem}
    lede: 1-3 paragraphs, with 2-3 sentences per paragraph, and 3 words per sentence:
    words: 3
    sentences: 2-3
    paragraphs: 1-3
{}
```

You can also use a shorthand version

```ArchieML

lorem: 2-4 paragraphs

lorem: 30 words, 2 sentences

```

## Usage Svelte

```svelte
<LoremText props={{ paragraphs: "2-4", lede: "This is an introduction:" }} />
```
