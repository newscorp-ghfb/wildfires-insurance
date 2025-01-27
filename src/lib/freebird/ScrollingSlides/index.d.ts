import type {
  ScrollStoryProps,
  ScrollStoryItem,
} from "../../shared/middleware/ScrollStory/index.js";
import type {
  SlideshowProps,
  SlideshowItem,
} from "../../shared/middleware/Slideshow/index.js";

export type scrollingSlidesItem = ScrollStoryItem & SlideshowItem;

/* ScrollingSlides extends ScrollStory */
export type ScrollingSlidesProps = ScrollStoryProps &
  SlideshowProps & {
    items: scrollingSlidesItem[];
  };
