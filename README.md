# quill-image-compress
<!-- [START badges] -->
[![NPM Version](https://img.shields.io/npm/v/quill-image-compress.svg)](https://www.npmjs.com/package/quill-image-compress)
[![License](https://img.shields.io/npm/l/quill-image-compress.svg)](https://github.com/benwinding/quill-image-compress/blob/master/LICENSE)
[![Downloads/week](https://img.shields.io/npm/dm/quill-image-compress.svg)](https://www.npmjs.com/package/quill-image-compress)
[![Github Issues](https://img.shields.io/github/issues/benwinding/quill-image-compress.svg)](https://github.com/benwinding/quill-image-compress)
![Build and Publish](https://github.com/benwinding/quill-image-compress/actions/workflows/push.yml/badge.svg)
<!-- [END badges] -->

Quill.js Module which compresses images that are uploaded to the editor

- [Live Demo!](https://benwinding.github.io/quill-image-compress/src/demo.html)
- [Live Demo! (with script tag)](https://benwinding.github.io/quill-image-compress/src/demo-script-tag.html)

## Install
`yarn add quill-image-compress`

## Features

- Will compress image when:
  - Drag/Dropped into quill
  - Pasted into quill
  - Clicked image load button
- Handles most image formats a browser can read:
  - `gif|jpeg|png|svg|webp|bmp|vnd`
- Compression options [more info](#options)
- Add multiple images in one drag/paste

_NOTE: :exclamation:you don't need `quill-image-drop-module`, it's included in this package:exclamation:_

## Quickstart

``` js
import ImageCompress from 'quill-image-compress';

Quill.register('modules/imageCompress', ImageCompress);

const quill = new Quill(editor, {
  // ...
  modules: {
    // ...
    imageCompress: {
      quality: 0.7, // default
      maxWidth: 1000, // default
      maxHeight: 1000, // default
      imageType: 'image/jpeg', // default
      debug: true, // default
      suppressErrorLogging: false, // default
      handleOnPaste: true, //default 
      insertIntoEditor: undefined, // default
    }
  }
});

```

## Quickstart (script tag)

``` html
    <script src="https://unpkg.com/quill-image-compress@1.2.11/dist/quill.imageCompressor.min.js"></script>
    <script>
      Quill.register("modules/imageCompressor", imageCompressor);
      
      var quill = new Quill("#editor", {
        modules: {
          imageCompressor: {
            quality: 0.9,
            maxWidth: 1000, // default
            maxHeight: 1000, // default
            imageType: 'image/jpeg'
          }
        }
      });
    </script>
```

## Options

- **[Integer] maxWidth, maxHeight**
  - Maximum width of images (in pixels)
- **[Float] quality**
  - Image quality range: 0.0 - 1.0
- **[String] imageType**
  - Values: 'image/jpeg' , 'image/png' ... etc
- **[Array] keepImageTypes**  
  Preserve image type and apply quality, maxWidth, maxHeight options
  - Values: ['image/jpeg', 'image/png']

- **[Array] ignoreImageTypes**  
  Image types contained in this array retain their original images, do not compress them.
  - Values: ['image'/jpeg', 'image/webp']
- **[Boolean] handleOnPaste**
  - Compress image on paste, the default behaviour. Set to false to disable processing pasted images.
- **[Function] insertIntoEditor**
  Custom function to handle inserting the image. If you wanted to upload the image to a webserver rather than embedding with Base64, you could use this function.
  - Example function, uploading to a webserver:
    ```js
    insertIntoEditor: (imageBase64URL, imageBlob, editor) => {    
      const formData = new FormData();
      formData.append("file", imageBlob);

      fetch("/upload", {method: "POST", body: formData})
        .then(response => response.text())
        .then(result => {
          const range = editor.getSelection();
          editor.insertEmbed(range.index, "image", `${result}`, "user");
        })
        .catch(error => {
          console.error(error);
        });
    }
    ```

- **[Boolean] debug**
  - Displays console logs: true/false

## Thanks
This project is based on [quill-image-uploader](https://github.com/NoelOConnell/quill-image-uploader), thanks mate!
