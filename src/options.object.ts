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
  insertIntoEditor?: (base64URL: string, imageBlob: Blob, editor: Quill) => void;
};
