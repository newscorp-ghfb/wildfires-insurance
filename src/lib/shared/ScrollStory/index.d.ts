import type { ComponentType } from "svelte";
import type { Item, onItemFn, StepperSet } from "../steppers/index.js";
import type { ArchieMLTextObject } from "../Text/index.js";

/* ScrollStory extends generic stepper item and set types */
export type ScrollStoryItem = Item & {
  text?: Item["text"] | ArchieMLTextObject; // override, as Scrollstory supports plain text and Text component compatible Text objects
  altText?: string; // A11Y
  component?: ComponentType;
  markup?: string;
  itemSpacing?: string; // per-item spacing
  itemOpacity?: string; // per-item opacity, 0-1
  itemColor?: string; // per-item text color
  itemBackgroundColor?: string; // per-item background color
  itemPaddingTop?: string; // per-item padding override
  itemPaddingBottom?: string; // per-item padding override
  itemPaddingLeft?: string; // per-item padding override
  itemPaddingRight?: string; // per-item padding override
  _style?: string; // private string of CSS applied inline per item to override component CSS vars
};

export type ScrollStoryProps = StepperSet & {
  items: ScrollStoryItem[];
  // ScrollStory-specific props
  id?: string;
  debug?: boolean;
  enabled?: boolean;
  stepper?: boolean;
  stepperClick?: boolean;
  stepperTheme?: string;
  stepperPosition?: string;
  stepperComponent?: ComponentType;
  threshold?: number;
  debugColor?: string;
  itemSpacing?: string; // global itemSpacing
  textBelow?: boolean;
  textStartPosition?: string;
  textTheme?: string;

  // make required
  processItem: onItemFn;
  onItemActive: onItemFn;
  onItemBlur: onItemFn;
};
