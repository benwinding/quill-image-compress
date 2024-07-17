export function b64toBlob(dataURI: string) {
    const byteString = atob(dataURI.split(',')[1]);
    const type = dataURI.slice(5).split(';')[0];
    const ab = new ArrayBuffer(byteString.length);
    let ia = new Uint8Array(ab);
    for (var i = 0; i < byteString.length; i++) {
        ia[i] = byteString.charCodeAt(i);
    }
    return new Blob([ab], { type: type });
}
