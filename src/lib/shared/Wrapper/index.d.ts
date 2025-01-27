import type { ComponentType } from "svelte";

export type WrapperProps = {
  id?: string;
  className?: string;
  hed?: string;
  leadin?: string;
  caption?: string;
  source?: string;
  credit?: string;
  note?: string;
  textAlign?: string;
  headerTextAlign?: string;
  footerTextAlign?: string;
  label?: string;
  maxWidth?: string;
  headerMaxWidth?: string;
  footerMaxWidth?: string;
  marginInline?: boolean | number;
  headerMarginInline?: boolean | number;
  footerMarginInline?: boolean | number;
  marginBlock?: boolean | number;
  keyWidth?: string;
  inset?: boolean;
  captionComponent?: ComponentType;
  element?: string;
  ariaLabelType?: string;
  assetType?: string;
};
