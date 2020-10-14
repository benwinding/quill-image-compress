export async function file2b64(file) {
  const fileReader = new FileReader();

  const promise = new Promise((resolve) => {
    fileReader.addEventListener(
      "load",
      () => {
        const base64ImageSrc = fileReader.result;
        resolve(base64ImageSrc);
      },
      false
    );
  });
  fileReader.readAsDataURL(file);
  return promise;
}
