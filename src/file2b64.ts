export async function file2b64(file: File) {
  const fileReader = new FileReader();

  const promise = new Promise<string>((resolve, reject) => {
    fileReader.addEventListener(
      "load",
      () => {
        const base64ImageSrc = fileReader.result?.toString();
        if (!base64ImageSrc) {
          reject('could not convert file to base64');
        } else {
          resolve(base64ImageSrc);
        }
      },
      false
    );
  });
  fileReader.readAsDataURL(file);
  return promise;
}
