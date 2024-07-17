import Quill from "quill";
import { ConsoleLogger } from "./ConsoleLogger";
import { file2b64 } from "./file2b64";
import { OptionsObject } from "options.object";

/*
From: https://github.com/kensnyder/quill-image-drop-module/blob/master/index.js
*/

const fallbackImage = "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyMDAiIGhlaWdodD0iMjAwIiB2aWV3Qm94PSIwIDAgMjAwIDIwMCI+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0iI0RERERERCIvPjxwYXRoIGZpbGw9IiM5OTk5OTkiIGQ9Ik00MC43NCA5My40NTV2MTAuNjZIMzguNnYtMTAuNjZoMi4xNFptMS45NSAyLjc0aDEuOTlsLjA5IDEuMDRxLjM4LS41Ny45NS0uODguNTgtLjMxIDEuMzMtLjMxLjc2IDAgMS4zLjM0LjU1LjMzLjgzIDEuMDEuMzYtLjYzLjk1LS45OS41OC0uMzYgMS4zNy0uMzYgMS4xOCAwIDEuODUuODEuNjguODEuNjggMi40NnY0LjhoLTIuMTR2LTQuOHEwLS45MS0uMjktMS4yNnQtLjg3LS4zNXEtLjQ2IDAtLjc5LjJ0LS41My41NnEwIC4xNC4wMS4yNHY1LjQxaC0yLjEzdi00LjhxMC0uODgtLjI5LTEuMjUtLjI5LS4zNi0uODgtLjM2LS40MyAwLS43Ni4xNy0uMzIuMTYtLjU0LjQ2djUuNzhoLTIuMTN2LTcuOTJabTE5Ljc3IDcuOTJoLTIuMTRxLS4xMS0uMjctLjItLjU3LS4wOC0uMy0uMTItLjYyLS4zMy41OC0uODcuOTZ0LTEuMjguMzhxLTEuMjUgMC0xLjkyLS42NC0uNjgtLjY0LS42OC0xLjc0IDAtMS4xNy45LTEuODEuOS0uNjQgMi42Mi0uNjRoMS4xOXYtLjYzcTAtLjU3LS4zLS44OS0uMy0uMzEtLjg4LS4zMS0uNTIgMC0uOC4yNS0uMjkuMjUtLjI5LjdsLTIuMDYtLjAxLS4wMS0uMDRxLS4wNS0xIC44Ny0xLjczdDIuNDMtLjczcTEuNDIgMCAyLjMuNzIuODkuNzIuODkgMi4wNXYzLjI4cTAgLjU2LjA4IDEuMDUuMDkuNDkuMjcuOTdabS00LjA5LTEuNDNxLjU2IDAgMS0uMjguNDQtLjI3LjU5LS42NHYtMS4xMmgtMS4xOXEtLjY4IDAtMS4wMy4zNHQtLjM1LjgycTAgLjQuMjYuNjR0LjcyLjI0Wm01LjAzLTIuMzF2LS4xNnEwLTEuODcuODItMy4wMi44MS0xLjE1IDIuMjgtMS4xNS42NyAwIDEuMTguMy41LjMuODYuODZsLjE3LTEuMDFoMS44NHY3Ljg4cTAgMS41NS0xLjAxIDIuMzktMS4wMS44NS0yLjgyLjg1LS42IDAtMS4yOC0uMTYtLjY3LS4xNy0xLjI0LS40NWwuMzktMS42cS40OS4yMyAxIC4zNS41MS4xMiAxLjExLjEyLjg4IDAgMS4yOS0uMzYuNDItLjM3LjQyLTEuMTR2LS43MnEtLjM1LjQ1LS44My42OC0uNDguMjMtMS4wOS4yMy0xLjQ2IDAtMi4yNy0xLjA3LS44Mi0xLjA3LS44Mi0yLjgyWm0yLjE0LS4xNnYuMTZxMCAxLjA0LjM1IDEuNjMuMzUuNiAxLjE0LjYuNDkgMCAuODMtLjE4LjM0LS4xOC41NS0uNTJ2LTMuNDRxLS4yMS0uMzYtLjU1LS41Ni0uMzQtLjItLjgxLS4yLS43OSAwLTEuMTUuNy0uMzYuNjktLjM2IDEuODFabTEwLjE2IDQuMDVxLTEuNzEgMC0yLjc0LTEuMDktMS4wMi0xLjEtMS4wMi0yLjh2LS4yOXEwLTEuNzYuOTctMi45MS45Ny0xLjE0IDIuNi0xLjEzIDEuNjEgMCAyLjQ5Ljk3Ljg5Ljk2Ljg5IDIuNjF2MS4xNmgtNC43M2wtLjAyLjA1cS4wNi43OC41MyAxLjI5LjQ2LjUgMS4yNi41LjcxIDAgMS4xOC0uMTR0MS4wMy0uNDVsLjU3IDEuMzJxLS40OC4zOS0xLjI2LjY1LS43OS4yNi0xLjc1LjI2Wm0tLjE5LTYuNTdxLS41OSAwLS45My40NS0uMzUuNDUtLjQzIDEuMTlsLjAyLjA0aDIuNjJ2LS4xOXEwLS42OC0uMzEtMS4wOS0uMzItLjQtLjk3LS40Wm0xNC44My00LjI0aDIuMTR2Ny4wN3EwIDEuOC0xLjE4IDIuNzctMS4xOS45Ny0zLjExLjk3LTEuOTEgMC0zLjA5LS45Ny0xLjE3LS45Ny0xLjE3LTIuNzd2LTcuMDdoMi4xNHY3LjA3cTAgMS4wNi41NyAxLjU4LjU2LjUyIDEuNTUuNTIgMSAwIDEuNTgtLjUyLjU3LS41Mi41Ny0xLjU4di03LjA3Wm0zLjggMi43NGgxLjk5bC4xIDEuMTNxLjM5LS42MS45Ny0uOTQuNTgtLjM0IDEuMy0uMzQgMS4yIDAgMS44Ny43NS42OC43Ni42OCAyLjM3djQuOTVIOTguOXYtNC45NHEwLS44LS4zMi0xLjE0LS4zMy0uMzMtLjk4LS4zMy0uNDIgMC0uNzYuMTctLjM0LjE4LS41Ni40OXY1Ljc1aC0yLjE0di03LjkyWm0xNS4yOSA3LjkyaC0yLjE0cS0uMTEtLjI3LS4yLS41Ny0uMDgtLjMtLjEyLS42Mi0uMzMuNTgtLjg3Ljk2dC0xLjI4LjM4cS0xLjI1IDAtMS45Mi0uNjQtLjY4LS42NC0uNjgtMS43NCAwLTEuMTcuOS0xLjgxLjktLjY0IDIuNjItLjY0aDEuMTl2LS42M3EwLS41Ny0uMy0uODktLjMtLjMxLS44OC0uMzEtLjUyIDAtLjguMjUtLjI5LjI1LS4yOS43bC0yLjA2LS4wMS0uMDEtLjA0cS0uMDUtMSAuODctMS43My45My0uNzMgMi40My0uNzMgMS40MiAwIDIuMy43Mi44OS43Mi44OSAyLjA1djMuMjhxMCAuNTYuMDggMS4wNS4wOS40OS4yNy45N1ptLTQuMDktMS40M3EuNTYgMCAxLS4yOC40NC0uMjcuNTktLjY0di0xLjEyaC0xLjE5cS0uNjggMC0xLjAzLjM0dC0uMzUuODJxMCAuNC4yNi42NHQuNzIuMjRabTYuNzYtNi40OSAxLjM0IDQuOTcuMTQuNzNoLjA0bC4xNS0uNzMgMS4zLTQuOTdoMi4yNGwtMi43IDcuOTJoLTIuMDRsLTIuNy03LjkyaDIuMjNabTEyLjggNy45MmgtMi4xNHEtLjEyLS4yNy0uMi0uNTctLjA4LS4zLS4xMi0uNjItLjMzLjU4LS44Ny45NnQtMS4yOC4zOHEtMS4yNSAwLTEuOTItLjY0LS42OC0uNjQtLjY4LTEuNzQgMC0xLjE3LjktMS44MS45LS42NCAyLjYyLS42NGgxLjE5di0uNjNxMC0uNTctLjMtLjg5LS4zLS4zMS0uODgtLjMxLS41MiAwLS44MS4yNS0uMjguMjUtLjI4LjdsLTIuMDYtLjAxLS4wMS0uMDRxLS4wNS0xIC44Ny0xLjczdDIuNDMtLjczcTEuNDIgMCAyLjMuNzIuODkuNzIuODkgMi4wNXYzLjI4cTAgLjU2LjA4IDEuMDUuMDkuNDkuMjcuOTdabS00LjA5LTEuNDNxLjU2IDAgMS0uMjguNDQtLjI3LjU5LS42NHYtMS4xMmgtMS4xOXEtLjY4IDAtMS4wMy4zNC0uMzYuMzQtLjM2LjgyIDAgLjQuMjcuNjQuMjYuMjQuNzIuMjRabTcuNjEtNi40OXY3LjkyaC0yLjE0di03LjkyaDIuMTRabTAtMy41MXYxLjYxaC0yLjE0di0xLjYxaDIuMTRabTQgMHYxMS40M2gtMi4xNHYtMTEuNDNoMi4xNFptOC41NSAxMS40M2gtMi4xNHEtLjEyLS4yNy0uMi0uNTctLjA4LS4zLS4xMi0uNjItLjMzLjU4LS44Ny45NnQtMS4yOC4zOHEtMS4yNSAwLTEuOTItLjY0LS42OC0uNjQtLjY4LTEuNzQgMC0xLjE3LjktMS44MS45LS42NCAyLjYyLS42NGgxLjE5di0uNjNxMC0uNTctLjMtLjg5LS4zLS4zMS0uODgtLjMxLS41MiAwLS44MS4yNS0uMjguMjUtLjI4LjdsLTIuMDYtLjAxLS4wMS0uMDRxLS4wNS0xIC44Ny0xLjczdDIuNDItLjczcTEuNDMgMCAyLjMxLjcyLjg5LjcyLjg5IDIuMDV2My4yOHEwIC41Ni4wOCAxLjA1LjA5LjQ5LjI3Ljk3Wm0tNC4wOS0xLjQzcS41NiAwIDEtLjI4LjQ0LS4yNy41OS0uNjR2LTEuMTJoLTEuMTlxLS42OCAwLTEuMDMuMzQtLjM2LjM0LS4zNi44MiAwIC40LjI3LjY0LjI2LjI0LjcyLjI0Wm0xMi41MS0yLjQ3di4xNnEwIDEuNzctLjggMi44My0uNzkgMS4wNi0yLjI4IDEuMDYtLjY5IDAtMS4yMS0uMjktLjUxLS4yOC0uODctLjg0bC0uMTYuOThoLTEuODN2LTExLjQzaDIuMTN2NC4zNXEuMzQtLjQ4LjgyLS43My40OC0uMjYgMS4xLS4yNiAxLjUxIDAgMi4zIDEuMTQuOCAxLjE0LjggMy4wM1ptLTIuMTQuMTZ2LS4xNnEwLTEuMTUtLjM0LTEuODMtLjM0LS42OC0xLjE2LS42OC0uNSAwLS44NC4yMS0uMzQuMjEtLjU0LjZ2My4zNXEuMi4zNi41NC41NS4zNS4xOS44Ni4xOS44MiAwIDEuMTUtLjU4LjMzLS41OC4zMy0xLjY1Wm01LjctNy42OXYxMS40M2gtMi4xNHYtMTEuNDNoMi4xNFptNS4yNyAxMS41OHEtMS43MiAwLTIuNzQtMS4wOS0xLjAzLTEuMS0xLjAzLTIuOHYtLjI5cTAtMS43Ni45Ny0yLjkxLjk3LTEuMTQgMi42MS0xLjEzIDEuNiAwIDIuNDkuOTcuODguOTYuODggMi42MXYxLjE2aC00LjczbC0uMDEuMDVxLjA2Ljc4LjUyIDEuMjkuNDcuNSAxLjI3LjUuNzEgMCAxLjE3LS4xNC40Ny0uMTQgMS4wMy0uNDVsLjU4IDEuMzJxLS40OS4zOS0xLjI3LjY1dC0xLjc0LjI2Wm0tLjE5LTYuNTdxLS42IDAtLjk0LjQ1LS4zNC40NS0uNDIgMS4xOWwuMDIuMDRoMi42MnYtLjE5cTAtLjY4LS4zMi0xLjA5LS4zMi0uNC0uOTYtLjRaIi8+PC9zdmc+";
export class ImageDrop {
  localDrag: boolean = false;

  constructor(
    private quill: Quill,
    private options: OptionsObject,
    private processImage: (dataUrl: string) => Promise<string>,
    private insertImage: (dataUrl: string) => void,
    private logger: ConsoleLogger,
  ) {
    // listen for drop and paste events
    this.quill.root.addEventListener("dragstart", (e) => this.handleDragStart(e), false);
    this.quill.root.addEventListener("dragend", (e) => this.handleDragEnd(e), false);
    this.quill.root.addEventListener("drop", (e) => this.handleDrop(e), false);
    this.quill.root.addEventListener("paste", (e) => this.handlePaste(e), false);
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
    this.logger.log("handleDrop", { evt });
    const files = evt.dataTransfer?.files;
    const imageFiles = Array.from(files || []).filter(f => IsMatch(f.type));

    if (imageFiles.length > 0) {
      this.logger.log("handleDrop", "found files", { evt, files, imageFiles });
      await this.pasteFilesIntoQuill(imageFiles);
      return;
    }

    if (evt.dataTransfer?.items) {
      this.logger.log("handleDrop", "found items", { evt, files, imageFiles });
      await this.handleDataTransfer(evt.dataTransfer, evt);
      return;
    }

    const draggedUrl = evt.dataTransfer?.getData('URL');
    this.logger.log("handleDrop", "trying getData('URL')", { draggedUrl });
    if (draggedUrl) {
      const blob = await (await fetch(draggedUrl)).blob();
      this.logger.log("handleDrop", "blob from drag event", { evt, files, imageFiles });
      await this.pasteFilesIntoQuill([blob]);
    }
  }

  private async handlePaste(evt: ClipboardEvent) {
    if (evt.clipboardData) {
      await this.handleDataTransfer(evt.clipboardData, evt);
    }
  }

  private async handleDataTransfer(dataTransfer: DataTransfer, evt: Event) {
    const items = Array.from(dataTransfer.items || []);

    const html = dataTransfer.getData('text/html');
    if (html && this.options.compressImagesInPastedHtml) {
      this.processHtml(html)
        .catch(e => this.logger.error("error while processing pasted html", e));
      evt.preventDefault();
      return;
    }

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

  private async processHtml(html: string) {

    const tmp = document.createElement('div')
    tmp.innerHTML = html;
    const imgNodeList = tmp.querySelectorAll('img');

    for (let i = 0; i < imgNodeList.length; i++) {
      const img = imgNodeList[i];
      if (img.src.startsWith("http")) {
        img.src = await fetch(img.src)
          .then(r => r.blob())
          .then(blob => file2b64(blob))
          .catch(e => {
            this.logger.error("Error while loading image from foreign URL:", e);
            return fallbackImage;
          });
      }
      img.src = await this.processImage(img.src);
    }

    this.logger.log("    processHtml", `pasting ${tmp} to quill...`);
    const range = this.quill.getSelection(true);
    const index = range != undefined ? range.index : this.quill.getLength();
    this.quill.clipboard.dangerouslyPasteHTML(index, tmp.innerHTML, "user");
  }

  private async pasteFilesIntoQuill(imageFiles: (Blob | null)[]) {
    this.logger.log("    pasteFilesIntoQuill", `pasting ${imageFiles.length} images...`);
    await Promise.all(imageFiles.map(async (imageFile, index) => {
      if (!imageFile) {
        return;
      }
      const base64ImageSrc = await file2b64(imageFile);
      this.logger.log("    pasteFilesIntoQuill", `pasting image (${index})`);
      this.insertImage(await this.processImage(base64ImageSrc));
    }));
    this.logger.log("    pasteFilesIntoQuill", "done");
  }
}

function IsMatch(fileType: string): boolean {
  return !!fileType.match(
    /^image\/(gif|jpe?g|a?png|svg|webp|bmp)/i
  )
}