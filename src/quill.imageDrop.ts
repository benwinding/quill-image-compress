import Quill from "quill";
import { ConsoleLogger } from "./ConsoleLogger";

const { file2b64 } = require("./file2b64");

/* 
From: https://github.com/kensnyder/quill-image-drop-module/blob/master/index.js
*/
export class ImageDrop {
  constructor(
    private quill: Quill,
    private onNewDataUrl: (file: any) => void,
    private logger: ConsoleLogger,
  ) {
    // listen for drop and paste events
    this.quill.root.addEventListener("drop", (e) => this.handleDrop(e), false);
    this.quill.root.addEventListener(
      "paste",
      (e) => this.handlePaste(e),
      false
    );
  }

  async handleNewImageFiles(imageFiles: File[]) {
    if (!Array.isArray(imageFiles)) {
      return;
    }
    const firstImage = imageFiles.pop() as any;
    if (!firstImage) {
      return;
    }
    const blob = firstImage.getAsFile ? firstImage.getAsFile() : firstImage;
    const base64ImageSrc = await file2b64(blob);
    this.logger.log("handleNewImageFiles", { base64ImageSrc });
    this.onNewDataUrl(base64ImageSrc);
  }

  handleDrop(evt: DragEvent) {
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
    const images = this.getImageFiles(evt.dataTransfer.files as any);
    this.handleNewImageFiles(images);
  }

  handlePaste(evt: ClipboardEvent) {
    const hasItems =
      evt.clipboardData &&
      evt.clipboardData.items &&
      !!evt.clipboardData.items.length;
    this.logger.log("handlePaste", { hasItems });
    if (!hasItems) {
      return;
    }
    const images = this.getImageFiles(evt.clipboardData.items as any);
    const hasImages = images.length > 0;
    this.logger.log("handlePaste", { hasImages, imageCount: images.length });
    if (!hasImages) {
      return;
    }

    // Text pasted from word will contain both text/html and image/png.
    const hasHtmlMixed = Array.from(evt.clipboardData.items).some(f => f.type === 'text/html');
    if (hasHtmlMixed) {
      this.logger.log("handlePaste also detected html");
    }

    evt.preventDefault();
    this.handleNewImageFiles(images);
  }

  getImageFiles(filesList: any[]) {
    const files = Array.from(filesList);
    this.logger.log("getImageFiles", { mimeTypes: files.map(f => f.type) });
    // check each file for an image
    function isFileImage(file: DataTransferItem) {
      const isImage = !!file.type.match(
        /^image\/(gif|jpe?g|a?png|svg|webp|bmp)/i
        );
      return isImage;
    }
    const images = files.filter(isFileImage);
    return images || [];
  }
}
