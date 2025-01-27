import type { Item, StepperSet, onItemFn } from "../steppers/index.js";
import type { MediaObject } from "../Media";

export type SlideshowItem = Item & {
  caption: string;
  slug: string;
  media: MediaObject; // make required
  label?: string;
  lazy?: boolean;
};

/* Slideshow extends generic stepper */
export type SlideshowProps = StepperSet & {
  items: SlideshowItem[];
  lazy: boolean;
  transitionType: string; // fade, horizontal, vertical
  transitionDuration: number; // milliseconds
  transitionEasing: string;
  showButtons: boolean;
  stepperTheme: string;

  // make required
  processItem: onItemFn;
  onItemActive: onItemFn;
  onItemBlur: onItemFn;
};
