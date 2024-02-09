import Quill from "quill";

export type OptionsObject = {
  validation?: boolean;
  debug?: boolean;
  suppressErrorLogging?: boolean;
  maxWidth?: number;
  maxHeight?: number;
  imageType?: string;
  keepImageTypes?: string[];
  ignoreImageTypes?: string[];
  quality?: number;
  uploadImage?: (imageBlob: Blob) => Promise<string>;
};
