import { ImageDrop } from "./quill.imageDrop";
import { warnAboutOptions } from "./options.validation";
import { file2b64 } from "./file2b64";
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

  static b64toBlob(dataURI: string) {
    const byteString = atob(dataURI.split(',')[1]);
    const type = dataURI.slice(5).split(';')[0];
    const ab = new ArrayBuffer(byteString.length);
    let ia = new Uint8Array(ab);
    for (var i = 0; i < byteString.length; i++) {
        ia[i] = byteString.charCodeAt(i);
    }
    return new Blob([ab], { type: type });
  }

  constructor(quill: Quill, options: OptionsObject) {
    this.quill = quill;
    this.options = options || {};
    const debug = !!options.debug;
    const suppressErrorLogging = !!options.suppressErrorLogging;
    this.Logger = new ConsoleLogger(debug, suppressErrorLogging);

    warnAboutOptions(options, this.Logger);
    const onImageDrop = async (dataUrl: string) => {
      this.Logger.log("onImageDrop", { dataUrl });
      const dataUrlCompressed = await this.downscaleImageFromUrl(dataUrl);
      this.insertToEditor(dataUrlCompressed, imageCompressor.b64toBlob(dataUrlCompressed));
    };
    this.imageDrop = new ImageDrop(quill, onImageDrop, this.Logger);

    this.Logger.log("fileChanged", { options, quill, debug });

    var toolbar = this.quill.getModule("toolbar");
    if (toolbar) {
      toolbar.addHandler("image", () => this.selectLocalImage());
    } else {
      this.Logger.error('Quill toolbar module not found! need { toolbar: // options } in Quill.modules for image icon to sit in')
    }
  }

  selectLocalImage() {
    this.range = this.quill.getSelection();
    this.fileHolder = document.createElement("input");
    this.fileHolder.setAttribute("type", "file");
    this.fileHolder.setAttribute("accept", "image/*");
    this.fileHolder.setAttribute("style", "visibility:hidden");

    this.fileHolder.onchange = () => this.fileChanged();

    document.body.appendChild(this.fileHolder);

    this.fileHolder.click();

    window.requestAnimationFrame(() => {
      this.fileHolder && document.body.removeChild(this.fileHolder);
    });
  }

  async fileChanged() {
    const files = this.fileHolder?.files;
    if (!files || !files.length) {
      return;
    }
    const file = files[0];
    this.Logger.log("fileChanged", { file });
    if (!file) {
      return;
    }
    const base64ImageSrc = await file2b64(file);
    const base64ImageSmallSrc = await this.downscaleImageFromUrl(
      base64ImageSrc
    );
    this.insertToEditor(base64ImageSmallSrc, imageCompressor.b64toBlob(base64ImageSmallSrc));
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

  insertToEditor(url: string, blob: Blob) {
    if (this.options.insertIntoEditor) {
      this.options.insertIntoEditor(url, blob);
    } else {
      this.Logger.log('insertToEditor', {url});
      this.range = this.quill.getSelection();
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
