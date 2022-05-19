export class ConsoleLogger {
  constructor(
    private debug: boolean,
    private suppressErrorLogging: boolean,
  ) {}

  prefixString() {
    return `</> quill-image-compress: `;
  }
  get log() {
    if (!this.debug) {
      return () => {};
    }
    const boundLogFn = console.log.bind(console, this.prefixString());
    return boundLogFn;
  }
  get error() {
    if (this.suppressErrorLogging) {
      return () => {};
    }
    const boundLogFn = console.error.bind(console, this.prefixString());
    return boundLogFn;
  }
  get warn() {
    if (this.suppressErrorLogging) {
      return () => {};
    }
    const boundLogFn = console.warn.bind(console, this.prefixString());
    return boundLogFn;
  }
}
