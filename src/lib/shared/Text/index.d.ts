export type ArchieMLText = {
  type: string;
  value: string;
};

export type ArchieMLTextObject = {
  value: ArchieMLText["value"];
  className?: string;
  id?: string;
};
