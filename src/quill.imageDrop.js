const { file2b64 } = require("./file2b64");

/* 
From: https://github.com/kensnyder/quill-image-drop-module/blob/master/index.js
*/
export class ImageDrop {
  constructor(quill, onNewDataUrl, logger) {
    // save the quill reference
    this.logger = logger;
    this.quill = quill;
    this.onNewDataUrl = onNewDataUrl;
    // listen for drop and paste events
    this.quill.root.addEventListener("drop", (e) => this.handleDrop(e), false);
    this.quill.root.addEventListener(
      "paste",
      (e) => this.handlePaste(e),
      false
    );
  }

  async handleNewImageFiles(imageFiles) {
    if (!Array.isArray(imageFiles)) {
      return;
    }
    const firstImage = imageFiles.pop();
    if (!firstImage) {
      return;
    }
    const blob = firstImage.getAsFile ? firstImage.getAsFile() : firstImage;
    const base64ImageSrc = await file2b64(blob);
    this.logger.log("handlePaste", { base64ImageSrc });
    this.onNewDataUrl(base64ImageSrc);
  }

  handleDrop(evt) {
    evt.preventDefault();
    const hasFiles =
      evt.dataTransfer &&
      evt.dataTransfer.files &&
      evt.dataTransfer.files.length;
    this.logger.log("handleDrop", { hasFiles });
    if (!hasFiles) {
      return;
    }
    if (document.caretRangeFromPoint) {
      const selection = document.getSelection();
      const range = document.caretRangeFromPoint(evt.clientX, evt.clientY);
      if (selection && range) {
        selection.setBaseAndExtent(
          range.startContainer,
          range.startOffset,
          range.startContainer,
          range.startOffset
        );
      }
    }
    const images = this.getImageFiles(evt.dataTransfer.files);
    this.handleNewImageFiles(images);
  }

  handlePaste(evt) {
    const hasItems =
      evt.clipboardData &&
      evt.clipboardData.items &&
      !!evt.clipboardData.items.length;
    this.logger.log("handlePaste", { hasItems });
    if (!hasItems) {
      return;
    }
    const images = this.getImageFiles(evt.clipboardData.items);

    if (images.length === 0) {
      return;
    }


    // Text pasted from word will contain both text/html and image/png. 
    // 
    if (Array.from(evt.clipboardData.items).some(f => f.type === 'text/html')) {
      this.logger.log("detected html, not handling");
      return;
    }

    evt.preventDefault();
    this.handleNewImageFiles(images);
  }

  getImageFiles(filesList) {
    const files = Array.from(filesList);
    this.logger.log("readFiles", { files });
    // check each file for an image
    function isFileImage(file) {
      const isImage = !!file.type.match(
        /^image\/(gif|jpe?g|a?png|svg|webp|bmp|vnd\.microsoft\.icon)/i
        );
      return isImage;
    }
    const images = files.filter(isFileImage);
    return images || [];
  }
}
