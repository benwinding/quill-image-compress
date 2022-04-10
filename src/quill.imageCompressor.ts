let debug = true;
let suppressErrorLogging = false;
const Logger = {
  prefixString() {
    return `</> quill-image-compress: `;
  },
  get log() {
    if (!debug) {
      return () => {};
    }
    const boundLogFn = console.log.bind(console, this.prefixString());
    return boundLogFn;
  },
  get error() {
    if (suppressErrorLogging) {
      return () => {};
    }
    const boundLogFn = console.error.bind(console, this.prefixString());
    return boundLogFn;
  },
  get warn() {
    if (suppressErrorLogging) {
      return () => {};
    }
    const boundLogFn = console.warn.bind(console, this.prefixString());
    return boundLogFn;
  },
};

const { ImageDrop } = require("./quill.imageDrop");
const { warnAboutOptions } = require("./options.validation");
const { file2b64 } = require("./file2b64");
const { downscaleImage } = require("./downscaleImage");

type OptionsObject = {
  validation?: boolean,
  debug?: boolean,
  suppressErrorLogging?: boolean,
  maxWidth?: boolean,
  maxHeight?: boolean,
  imageType?: boolean,
  keepImageTypes?: boolean,
  ignoreImageTypes?: boolean,
  quality?: boolean,
}

class imageCompressor {
  quill: any;
  range: any;
  options: OptionsObject;
  imageDrop: any;
  fileHolder: HTMLInputElement | undefined;

  constructor(quill: any, options: OptionsObject) {
    this.quill = quill;
    this.range = null;
    this.options = options || {};
    debug = !!options.debug;
    suppressErrorLogging = !!options.suppressErrorLogging;

    warnAboutOptions(options);
    const onImageDrop = async (dataUrl: string) => {
      Logger.log("onImageDrop", { dataUrl });
      const dataUrlCompressed = await this.downscaleImageFromUrl(dataUrl);
      this.insertToEditor(dataUrlCompressed);
    };
    this.imageDrop = new ImageDrop(quill, onImageDrop, Logger);

    Logger.log("fileChanged", { options, quill, debug });

    var toolbar = this.quill.getModule("toolbar");
    if (toolbar) {
      toolbar.addHandler("image", () => this.selectLocalImage());
    } else {
      Logger.error('Quill toolbar module not found! need { toolbar: // options } in Quill.modules for image icon to sit in')
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
    Logger.log("fileChanged", { file });
    if (!file) {
      return;
    }
    const base64ImageSrc = await file2b64(file);
    const base64ImageSmallSrc = await this.downscaleImageFromUrl(
      base64ImageSrc
    );
    this.insertToEditor(base64ImageSmallSrc);
  }

  async downscaleImageFromUrl(dataUrl: string) {
    const dataUrlCompressed = await downscaleImage(
      dataUrl,
      this.options.maxWidth,
      this.options.maxHeight,
      this.options.imageType,
      this.options.keepImageTypes,
      this.options.ignoreImageTypes,
      this.options.quality,
      Logger,
    );
    Logger.log("downscaleImageFromUrl", { dataUrl, dataUrlCompressed });
    return dataUrlCompressed;
  }

  insertToEditor(url: string) {
    Logger.log('insertToEditor', {url});
    this.range = this.quill.getSelection();
    const range = this.range;
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
    Logger.log("estimated img size: " + fileSizeKiloBytes + " kb");
  }
}

(window as any)['imageCompressor'] = imageCompressor;
export { imageCompressor };
export default imageCompressor;
