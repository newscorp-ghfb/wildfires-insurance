// shared fragments used in article query
// See https://github.com/nytm/wf-amp/blob/master/src/static/sharedfragments.graphql and
// https://github.com/nytm/wf-amp/blob/master/src/static/articlequery.graphql for the
// origin of these query fragments
const sharedFragments = `
  fragment DocumentBlock on DocumentBlock {
    content @filterEmpty {
      __typename
      ...ParagraphBlock
      ...Heading1Block
      ...Heading2Block
      ...Heading3Block
      ...DetailBlock
      ...LabelBlock
      ...ListBlock
      ...ImageBlock
      ...SlideshowBlock
      ...VideoBlock
      ...InteractiveBlock
      ...RuleBlock
      ...AudioBlock
      ...RelatedLinksBlock
      ...UnstructuredBlock
    }
  }

	fragment embeddedInteractive on EmbeddedInteractive {
    sourceId
  }

  fragment InteractiveBlock on InteractiveBlock {
    size
    media {
      __typename
      ...embeddedInteractive
    }
  }

  fragment Video on Video {
    sourceId
  }

  fragment VideoBlock on VideoBlock {
    autoplay
    hideControls
    looping
    media {
      __typename
      ...Video
    }
    muted
  }

  fragment RuleBlock on RuleBlock {
    type
  }

  fragment SlideshowBlock on SlideshowBlock {
    __typename
    size
    media {
      sourceId
    }
  }

  fragment Heading1Block on Heading1Block {
    textAlign
    content {
      __typename
      ...TextInline_content
    }
  }

  fragment Heading2Block on Heading2Block {
    textAlign
    content {
      ...TextInline_content
    }
  }

  fragment Heading3Block on Heading3Block {
    textAlign
    content {
      ...TextInline_content
    }
  }

  fragment ListBlock on ListBlock {
    style
    content {
      ... on ListItemBlock {
        content {
          ...ParagraphBlock
        }
      }
    }
  }

  fragment ParagraphBlock on ParagraphBlock {
    content {
      ...TextInline_content
    }
  }

  fragment LabelBlock on LabelBlock {
    textAlign
    content {
      ...TextInline_content
    }
  }

  fragment DetailBlock on DetailBlock {
    content {
      ...TextInline_content
    }
  }

  fragment TextBlock on TextInline {
    __typename
    text
    formats {
      __typename
      ...Italic
      ...Bold
      ...Link
    }
  }

  fragment Italic on ItalicFormat {
    type
  }

  fragment Bold on BoldFormat {
    type
  }

  fragment Link on LinkFormat {
    url
    title
  }

  fragment Image on Image {
    sourceId
  }

  fragment ImageBlock on ImageBlock {
    size
    media {
      __typename
      ...Image
    }
  }

  fragment Audio on Audio {
    headline {
      default
    }
    summary
    sourceId
  }

  fragment AudioBlock on AudioBlock {
    media {
      ...Audio
    }
  }

	fragment RelatedLinksBlock on RelatedLinksBlock {
		title {
      ...TextInline_content
    }
    displayStyle
    description {
      ...TextInline_content
    }
		related @filterEmpty {
			__typename
			... on Article {
				sourceId
			}
			... on Interactive {
				sourceId
			}
		}
  }

  fragment UnstructuredBlock on UnstructuredBlock {
    dataType
    data
  }

  fragment TextInline_content on InlineUnion {
    __typename
    ... on LineBreakInline {
      __typename
      type
    }
    ...TextBlock
  }
`;

const Article = `fragment Article on Article {
    __typename
		slug
		sourceId
    headline {
      default
    }
		summary
    sprinkled {
      body {
        ...DocumentBlock
      }
		}
	}
`;

export const allArticleFields = `
  query AllArticleFields($id: String!) {
    article(id: $id) {
      ...Article
    }
  }
  ${Article}
  ${sharedFragments}
`;
