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
    this.readFiles(evt.dataTransfer.files, (e) => this.onNewDataUrl(e));
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
    this.readFiles(evt.clipboardData.items, (dataUrl) => {
      const hasSelection = !!this.quill.getSelection();
			this.logger.log("handlePaste.callBack", { hasSelection, dataUrl });
      if (hasSelection) {
        // we must be in a browser that supports pasting (like Firefox)
        // so it has already been placed into the editor
      } else {
        // otherwise we wait until after the paste when this.quill.getSelection()
        // will return a valid index
        setTimeout(() => this.onNewDataUrl(dataUrl), 0);
      }
    });
  }

  readFiles(files, callback) {
    this.logger.log("readFiles", { files });
    // check each file for an image
    Array.from(files).map((file) => {
      const isImage = !!file.type.match(
        /^image\/(gif|jpe?g|a?png|svg|webp|bmp|vnd\.microsoft\.icon)/i
      );
      if (!isImage) {
        return;
      }
      this.logger.log("readFiles", { isImage, file });
      // set up file reader
      const reader = new FileReader();
      reader.onload = (evt) => {
        callback(evt.target.result);
      };
      // read the clipboard item or file
      const blob = file.getAsFile ? file.getAsFile() : file;
      if (blob instanceof Blob) {
        reader.readAsDataURL(blob);
      }
    });
  }
}
