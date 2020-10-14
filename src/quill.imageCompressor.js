function warnAboutOptions(options) {
  // Safe-ify Options
  options.maxWidth = options.maxWidth || 1000;
  options.maxHeight = options.maxHeight || 1000;

  if (options.maxWidth && typeof options.maxWidth !== "number") {
    console.warn(
      `[config error] 'maxWidth' is required to be a "number" (in pixels), 
recieved: ${options.maxWidth}
-> using default 1000`
    );
    options.maxWidth = 1000;
  }
  if (options.maxHeight && typeof options.maxHeight !== "number") {
    console.warn(
      `[config error] 'maxHeight' is required to be a "number" (in pixels), 
recieved: ${options.maxHeight}
-> using default 1000`
    );
    options.maxHeight = 1000;
  }
  if (options.quality && typeof options.quality !== "number") {
    console.warn(
      `quill.imageCompressor: [config error] 'quality' is required to be a "number", 
recieved: ${options.quality}
-> using default 0.7`
    );
    options.quality = 0.7;
  }
  if (
    options.imageType &&
    (typeof options.imageType !== "string" ||
      !options.imageType.startsWith("image/"))
  ) {
    console.warn(
      `quill.imageCompressor: [config error] 'imageType' is required be in the form of "image/png" or "image/jpeg" etc ..., 
recieved: ${options.imageType}
-> using default image/jpeg`
    );
    options.imageType = "image/jpeg";
  }
}

let debug = true;
const Logger = {
  prefixString() {
    return `</> quill-image-compress: `;
  },
  get log() {
    if (!debug) {
      return (...any) => {};
    }
    const boundLogFn = console.log.bind(console, this.prefixString());
    return boundLogFn;
  }
};

const { ImageDrop } = require('./quill.imageDrop');

class imageCompressor {
  constructor(quill, options) {
    this.quill = quill;
    this.range = null;
    this.options = options;
    debug = options && options.debug;

    const onImageDrop = async (dataUrl) => {
      Logger.log('onImageDrop', {dataUrl});
      const base64ImageSmallSrc = await this.downscaleImageFromUrl(dataUrl);
      this.insertToEditor(base64ImageSmallSrc);
    };
    this.imageDrop = new ImageDrop(quill, onImageDrop, Logger);  
    warnAboutOptions(options);

    Logger.log('fileChanged', {options, quill, debug});

    var toolbar = this.quill.getModule("toolbar");
    toolbar.addHandler("image", () => this.selectLocalImage());
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
      document.body.removeChild(this.fileHolder);
    });
  }

  fileChanged() {
    const file = this.fileHolder.files[0];
    Logger.log('fileChanged', {file});
    if (!file) {
      return;
    }

    const fileReader = new FileReader();

    fileReader.addEventListener(
      "load",
      async () => {
        const base64ImageSrc = fileReader.result;
        const base64ImageSmallSrc = await this.downscaleImageFromUrl(base64ImageSrc);
        this.insertToEditor(base64ImageSmallSrc);
      },
      false
    );
    fileReader.readAsDataURL(file);
  }

  async downscaleImageFromUrl(dataUrl) {
    const base64ImageSrcNew = await downscaleImage(
      dataUrl,
      this.options.maxWidth,
      this.options.maxHeight,
      this.options.imageType,
      this.options.quality,
      this.debug
    );
    return base64ImageSrcNew;
  }

  insertToEditor(url) {
    this.range = this.quill.getSelection();
    const range = this.range;
    // Insert the compressed image
    this.logFileSize(url);
    this.quill.insertEmbed(range.index, "image", `${url}`, 'user');
    // Move cursor to next position
    range.index++;
    this.quill.setSelection(range, "api");
  }

  logFileSize(dataUrl) {
    const head = "data:image/png;base64,";
    const fileSizeBytes = Math.round(((dataUrl.length - head.length) * 3) / 4);
    const fileSizeKiloBytes = (fileSizeBytes / 1024).toFixed(0);
    Logger.log("estimated img size" + fileSizeKiloBytes + " kb");
  }
}

// Take an image URL, downscale it to the given width, and return a new image URL.
async function downscaleImage(
  dataUrl,
  maxWidth,
  maxHeight,
  imageType,
  imageQuality
) {
  "use strict";
  // Provide default values
  imageType = imageType || "image/jpeg";
  imageQuality = imageQuality || 0.7;

  // Create a temporary image so that we can compute the height of the downscaled image.
  const image = new Image();
  image.src = dataUrl;
  await new Promise(resolve => {
    image.onload = () => {
      resolve();
    };
  });
  const [newWidth, newHeight] = getDimensions(
    image.width,
    image.height,
    maxWidth,
    maxHeight
  );

  // Create a temporary canvas to draw the downscaled image on.
  const canvas = document.createElement("canvas");
  canvas.width = newWidth;
  canvas.height = newHeight;

  // Draw the downscaled image on the canvas and return the new data URL.
  const ctx = canvas.getContext("2d");
  ctx.drawImage(image, 0, 0, newWidth, newHeight);
  const newDataUrl = canvas.toDataURL(imageType, imageQuality);
  Logger.log("downscaling image...", {
    args: {
      dataUrl,
      maxWidth,
      maxHeight,
      imageType,
      imageQuality,
      debug
    },
    newHeight,
    newWidth
  });
  return newDataUrl;
}

function getDimensions(inputWidth, inputHeight, maxWidth, maxHeight) {
  if (inputWidth <= maxWidth && inputHeight <= maxHeight) {
    return [inputWidth, inputHeight];
  }
  if (inputWidth > maxWidth) {
    const newWidth = maxWidth;
    const newHeight = Math.floor((inputHeight / inputWidth) * newWidth);

    if (newHeight > maxHeight) {
      const newHeight = maxHeight;
      const newWidth = Math.floor((inputWidth / inputHeight) * newHeight);
      return [newWidth, newHeight];
    } else {
      return [newWidth, newHeight];
    }
  }
  if (inputHeight > maxHeight) {
    const newHeight = maxHeight;
    const newWidth = Math.floor((inputWidth / inputHeight) * newHeight);
    return [newWidth, newHeight];
  }
}

window.imageCompressor = imageCompressor;
export { imageCompressor };
export default imageCompressor;
