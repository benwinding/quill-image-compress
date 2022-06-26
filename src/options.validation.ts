import { OptionsObject } from 'options.object';
import { ConsoleLogger } from './ConsoleLogger';

export function warnAboutOptions(options: OptionsObject, Logger: ConsoleLogger) {
  // Safe-ify Options
  options.maxWidth = options.maxWidth || 1000;
  options.maxHeight = options.maxHeight || 1000;

  if (options.maxWidth && typeof options.maxWidth !== "number") {
    Logger.warn(
      `[config error] 'maxWidth' is required to be a "number" (in pixels), 
received: ${options.maxWidth}
-> using default 1000`
    );
    options.maxWidth = 1000;
  }
  if (options.maxHeight && typeof options.maxHeight !== "number") {
    Logger.warn(
      `[config error] 'maxHeight' is required to be a "number" (in pixels), 
received: ${options.maxHeight}
-> using default 1000`
    );
    options.maxHeight = 1000;
  }
  if (options.quality && typeof options.quality !== "number") {
    Logger.warn(
      `quill.imageCompressor: [config error] 'quality' is required to be a "number", 
received: ${options.quality}
-> using default 0.7`
    );
    options.quality = 0.7;
  }
  if (
    options.imageType &&
    (typeof options.imageType !== "string" ||
      !options.imageType.startsWith("image/"))
  ) {
    Logger.warn(
      `quill.imageCompressor: [config error] 'imageType' is required be in the form of "image/png" or "image/jpeg" etc ..., 
received: ${options.imageType}
-> using default image/jpeg`
    );
    options.imageType = "image/jpeg";
  }
  if (!options.keepImageTypes) {
    options.keepImageTypes = []
  }
  if (
    options.keepImageTypes &&
    (!Array.isArray(options.keepImageTypes))
  ) {
    Logger.warn(
      `quill.imageCompressor: [config error] 'keepImageTypes' is required to be a "array", received: ${options.keepImageTypes} -> using default []`
    )
    options.keepImageTypes = [];
  }
  if (!options.ignoreImageTypes) {
    options.ignoreImageTypes = []
  }
  if (
    options.ignoreImageTypes &&
    (!Array.isArray(options.ignoreImageTypes))
  ) {
    Logger.warn(
      `quill.imageCompressor: [config error] 'ignoreImageTypes' is required to be a "array", received: ${options.ignoreImageTypes} -> using default []`
    )
    options.ignoreImageTypes = [];
  }
  if (options.insertIntoEditor && typeof options.insertIntoEditor !== "function") {
    Logger.warn(
      `quill.imageCompressor: [config error] 'insertIntoEditor' is required to be a "function", received: ${options.insertIntoEditor} -> using default undefined`
    )
    options.insertIntoEditor = undefined;
  }
}
