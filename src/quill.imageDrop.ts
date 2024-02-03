import Quill from "quill";
import { ConsoleLogger } from "./ConsoleLogger";

import { file2b64 } from "./file2b64";

/*
From: https://github.com/kensnyder/quill-image-drop-module/blob/master/index.js
*/
export class ImageDrop {
  localDrag: boolean = false;

  constructor(
    private quill: Quill,
    private onNewDataUrl: (dataUrl: string) => void,
    private logger: ConsoleLogger,
  ) {
    // listen for drop and paste events
    this.quill.root.addEventListener("dragstart", (e) => this.handleDragStart(e), false);
    this.quill.root.addEventListener("dragend", (e) => this.handleDragEnd(e), false);
    this.quill.root.addEventListener("drop", (e) => this.handleDrop(e), false);
    this.quill.root.addEventListener(
      "paste",
      (e) => this.handlePaste(e),
      false
    );
  }

  private handleDragStart(evt: DragEvent) {
    this.localDrag = true;
  }

  private handleDragEnd(evt: DragEvent) {
    this.localDrag = false;
  }

  private async handleDrop(evt: DragEvent) {
    if (this.localDrag)
      return; // use default method
    evt.preventDefault();
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
    this.logger.log("handleDrop", {evt});
    const files = evt.dataTransfer?.files;
    const imageFiles = Array.from(files || []).filter(f => IsMatch(f.type));
    if (imageFiles.length > 0) {
      this.logger.log("handleDrop", "found files", { evt, files, imageFiles });
      await this.pasteFilesIntoQuill(imageFiles);
      return;
    }
    if (evt.dataTransfer?.items) {
      this.logger.log("handleDrop", "found items", { evt, files, imageFiles });
      await this.handleDataTransferList(evt.dataTransfer?.items, evt);
      return;
    }
    const draggedUrl = evt.dataTransfer?.getData('URL');
    this.logger.log("handleDrop", "trying getData('URL')", {draggedUrl});
    if (draggedUrl) {
      const blob = await (await fetch(draggedUrl)).blob();
      this.logger.log("handleDrop", "blob from drag event", { evt, files, imageFiles });
      await this.pasteFilesIntoQuill([blob]);
    }
  }

  private async handlePaste(evt: ClipboardEvent) {
    await this.handleDataTransferList(evt.clipboardData?.items, evt);
  }

  private async handleDataTransferList(dataTransferItems: DataTransferItemList | undefined, evt: { preventDefault: () => void }) {
    const items = Array.from(dataTransferItems || []);
    // Can only compress images of type "file"
    const images = items.filter(f => f.kind === 'file' && IsMatch(f.type));
    const fileTypes = items.map(f => ({ type: f.type, kind: f.kind }));
    this.logger.log("handleDataTransferList", { fileTypes, imageCount: images.length });
    if (!images.length) {
      // No images in clipboard, proceed with inbuilt paste into quill
      return;
    }
    evt.preventDefault();
    const imageFiles = images.map(image => image.getAsFile());
    await this.pasteFilesIntoQuill(imageFiles);
  }

  private async pasteFilesIntoQuill(imageFiles: (Blob | null)[]) {
    this.logger.log("    pasteFilesIntoQuill", `pasting ${imageFiles.length} images...`);
    await Promise.all(imageFiles.map(async (imageFile, index) => {
      if (!imageFile) {
        return;
      }
      const base64ImageSrc = await file2b64(imageFile);
      this.logger.log("    pasteFilesIntoQuill", `pasting image (${index})`);
      this.onNewDataUrl(base64ImageSrc);
    }));
    this.logger.log("    pasteFilesIntoQuill", "done");
  }
}

function IsMatch(fileType: string): boolean {
  return !!fileType.match(
    /^image\/(gif|jpe?g|a?png|svg|webp|bmp)/i
  )
}