import type { ComponentType } from "svelte";
import type { MediaObject } from "../Media";

/**
 * These type definitions are for "step" or "stepper"-based stories,
 * which are multi-step, visual narratives where only one step, or "item",
 * has exclusive focus. They usually have a text blurb and an associated visual.
 *
 * For example: slideshows, tap stories and "scrolling graphics".
 */

/**
 * ArchieML items from Google doc. They can come in two forms:
 * 1) as a series of text
 * [.+items]
 *  scrolly text one, not in an array
 *  scrolly text two, not in an array
 * []
 *
 * 2) custom objects, which may include a text property
 * [.items]
 *  text: scrolly text one, in an array
 *  text: scrolly text two, in an array
 * []
 *
 * After processing, the first option is normalized
 * to match the more common custom object style of option two:
 * [{type:"text", value:"tk"}].
 *
 * By convention, the second option would likely
 * have a text property and may include any of the
 * expected PreprocessedItem properties.
 */
export type GoogleDocItem = PreprocessedItem & {
  type?: string;
  value?: string;
};

/**
 * This type corresponds to the pre-processed shape of data
 * coming from an ArchieML doc or other data source. As such, it 
 * doesn't have required props. Post-processed `Item` types do have
 * requirements. 
 * 
 * In ArchieML, an array of the PreprocessedItems might 
 * look like this, which includes template-specific data
 * in the generic 'props' object. 
 * 
 [.items]
*  text: caption for a first image in slideshow.
*  id: moscow-before
*  props: {
*    label: Before
*  }
*  text: caption for a second image in slideshow.
*  id: moscow-after
*  props: {
*    label: After
*  }
* []
 * 
 */
export type PreprocessedItem = {
  id?: string; // becomes an element id, and used internally for lookups. auto-generated if not provided
  text?: string;
  markup?: string; // html string
  component?: ComponentType;
  props?: object; // per-item values, defined by component types that extend stepper item functionality.
};

export type Item = PreprocessedItem & {
  id: string; // unique, and auto-generated in processing step if not specified
  index: number; // should be auto-generated in processing step
  active: boolean;
  previousActive?: boolean;
  nextActive?: boolean;
  offset?: number;
  media?: MediaObject?;
};

// Handlers pass in an item for
// manipulation but don't return a value
export type onItemFn = (item: Item) => void;

/**
 * This type is the basic building block of a stepper interactive,
 * regardless of front-end implementation.
 */
export type StepperSet = {
  items: Item[];
  id: string;
  debug: boolean;
  debugColor?: string;
  enabled: boolean;
  stepper: boolean;
  stepperClick?: boolean; // stepper dots can be clickable
  stepperPosition?: string;
  stepperTheme?: string;
  threshold: number; // trigger point (defined in child component) for when item focus should update
  processItem?: onItemFn;
  onItemActive?: onItemFn;
  onItemBlur?: onItemFn;
};
