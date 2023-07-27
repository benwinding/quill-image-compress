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
    const files = await getFilesFromDragEvent(evt);
    const filesFiltered = Array.from(files || []).filter(f => IsMatch(f.type));

    filesFiltered.forEach(async image => {
      if (image) {
        const base64ImageSrc = await file2b64(image);
        this.logger.log("handleNewImageFiles", { evt, files, filesFiltered, image, base64ImageSrc });
        this.onNewDataUrl(base64ImageSrc);
        return;
      }

      const blob = await getBlobFromDragEvent(evt);
      if (!!blob) {
        const base64ImageSrc = await file2b64(blob);
        this.logger.log("handleNewImageFiles", { evt, blob, base64ImageSrc });
        this.onNewDataUrl(base64ImageSrc);
        return;
      }
    })
  }

  private async handlePaste(evt: ClipboardEvent) {
    const files = Array.from(evt?.clipboardData?.items || []);
    this.logger.log("handlePaste", { files, evt });

    // Text pasted from word will contain text/rtf
    const isRichTextPaste = files.find(f => f.type === 'text/rtf')
    if (isRichTextPaste) {
      return;
    }
    const images = files.filter(f => IsMatch(f.type));
    this.logger.log("handlePaste", { images, evt });
    if (!images.length) {
      return;
    }
    // Text pasted from word will contain both text/html and image/png.
    const imagesNoHtml = images.filter(f => f.type !== 'text/html');
    if (!imagesNoHtml.length) {
      this.logger.log("handlePaste also detected html");
      return;
    }
    evt.preventDefault();

    imagesNoHtml.forEach(async image => {
      const blob = image?.getAsFile()
      if (!blob) {
        return;
      }
      const base64ImageSrc = await file2b64(blob);
      this.logger.log("handleNewImageFiles", { base64ImageSrc });
      this.onNewDataUrl(base64ImageSrc);  
    })
  }
}

async function getBlobFromDragEvent(evt: DragEvent): Promise<Blob | undefined> {
  const draggedUrl = evt.dataTransfer?.getData('URL');
  if (draggedUrl) {
    const blob = await (await fetch(draggedUrl)).blob();
    return blob;
  }
}

async function getFilesFromDragEvent(evt: DragEvent): Promise<FileList | undefined> {
  const files = evt?.dataTransfer?.files;
  return files;
}

function IsMatch(fileType: string): boolean {
  return !!fileType.match(
    /^image\/(gif|jpe?g|a?png|svg|webp|bmp)/i
  )
}