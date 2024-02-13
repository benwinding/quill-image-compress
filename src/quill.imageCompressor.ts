import { ImageDrop } from "./quill.imageDrop";
import { warnAboutOptions } from "./options.validation";
import { file2b64 } from "./file2b64";
import { b64toBlob } from "./b64toBlob";
import { downscaleImage } from "./downscaleImage";
import Quill, { RangeStatic } from "quill";
import { ConsoleLogger } from './ConsoleLogger';
import { OptionsObject } from "./options.object";

class imageCompressor {
  private quill: Quill;
  private range?: RangeStatic | null;
  private options: OptionsObject;
  private imageDrop: ImageDrop;
  private fileHolder: HTMLInputElement | undefined;
  private Logger: ConsoleLogger;


  constructor(quill: Quill, options: OptionsObject) {
    this.quill = quill;
    this.options = options || {};
    const debug = !!options.debug;
    const suppressErrorLogging = !!options.suppressErrorLogging;
    this.Logger = new ConsoleLogger(debug, suppressErrorLogging);

    warnAboutOptions(options, this.Logger);

    this.imageDrop = new ImageDrop(quill,options, (i) => this.downscaleImageFromUrl(i), (i) => this.insertToEditor(i), this.Logger);

    this.Logger.log("fileChanged", { options, quill, debug });

    var toolbar = this.quill.getModule("toolbar");
    if (toolbar) {
      toolbar.addHandler("image", () => this.selectLocalImage());
    } else {
      this.Logger.error('Quill toolbar module not found! need { toolbar: // options } in Quill.modules for image icon to sit in')
    }
  }

  selectLocalImage(onFileChanged?: () => void) {
    this.range = this.quill.getSelection();
    this.fileHolder = document.createElement("input");
    this.fileHolder.setAttribute("type", "file");
    this.fileHolder.setAttribute("accept", "image/*");
    this.fileHolder.setAttribute("style", "visibility:hidden");

    this.fileHolder.onchange = () => this.fileChanged().then(() => onFileChanged && onFileChanged());

    document.body.appendChild(this.fileHolder);

    this.fileHolder.click();

    window.requestAnimationFrame(() => {
      this.fileHolder && document.body.removeChild(this.fileHolder);
    });
  }

  async fileChanged(externallyProvidedFiles?: File[]) {
    const files = externallyProvidedFiles || this.fileHolder?.files;
    if (!files || !files.length) {
      return;
    }
    const file = files[0];
    this.Logger.log("fileChanged", { file });
    if (!file) {
      return;
    }
    const base64ImageSrc = await file2b64(file);
    const base64ImageSmallSrc = await this.processImage(base64ImageSrc);

    this.insertToEditor(base64ImageSmallSrc);
  }

  async downscaleImageFromUrl(dataUrl: string) {
    const dataUrlCompressed = await downscaleImage(
      this.Logger,
      dataUrl,
      this.options.maxWidth,
      this.options.maxHeight,
      this.options.imageType,
      this.options.keepImageTypes,
      this.options.ignoreImageTypes,
      this.options.quality,
    );
    this.Logger.log("downscaleImageFromUrl", { dataUrl, dataUrlCompressed });
    return dataUrlCompressed;
  }

  async processImage(dataUrl: string): Promise<string> {
    dataUrl = await this.downscaleImageFromUrl(dataUrl);
    if (this.options.uploadImage) {
      dataUrl = await this.options.uploadImage(b64toBlob(dataUrl));
    }
    return dataUrl;
  }

  async insertToEditor(url: string) {

    this.Logger.log('insertToEditor', { url });
    this.range = this.quill.getSelection(true);
    const range = this.range;
    if (!range) {
      return;
    }
    // Insert the compressed image
    this.logFileSize(url);
    this.quill.insertEmbed(range.index, "image", `${url}`, "user");
    // Move cursor to next position
    range.index++;
    this.quill.setSelection(range, "api");

  }

  logFileSize(dataUrl: string) {
    const head = "data:image/png;base64,";
    const fileSizeBytes = Math.round(((dataUrl.length - head.length) * 3) / 4);
    const fileSizeKiloBytes = (fileSizeBytes / 1024).toFixed(0);
    this.Logger.log("estimated img size: " + fileSizeKiloBytes + " kb");
  }
}

(window as any)['imageCompressor'] = imageCompressor;
export { imageCompressor };
export default imageCompressor;
