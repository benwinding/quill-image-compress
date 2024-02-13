import Quill from "quill";

export type OptionsObject = {
  validation?: boolean;
  debug?: boolean;
  suppressErrorLogging?: boolean;
  maxWidth?: number;
  maxHeight?: number;
  imageType?: string;
  compressImagesInPastedHtml?:boolean;
  keepImageTypes?: string[];
  ignoreImageTypes?: string[];
  quality?: number;
  uploadImage?: (imageBlob: Blob) => Promise<string>;
};
