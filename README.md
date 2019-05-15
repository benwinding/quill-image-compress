# quill-image-compress
<!-- [START badges] -->
[![NPM Version](https://img.shields.io/npm/v/quill-image-compress.svg)](https://www.npmjs.com/package/quill-image-compress) 
[![License](https://img.shields.io/npm/l/quill-image-compress.svg)](https://github.com/benwinding/quill-image-compress/blob/master/LICENSE) 
[![Downloads/week](https://img.shields.io/npm/dm/quill-image-compress.svg)](https://www.npmjs.com/package/quill-image-compress) 
[![Github Issues](https://img.shields.io/github/issues/benwinding/quill-image-compress.svg)](https://github.com/benwinding/quill-image-compress)
<!-- [END badges] -->

Quill.js Module which compresses images that are uploaded to the editor 

## Install
`yarn add quill-image-compress`

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
      imageType: 'image/jpeg', // default
      debug: true, // default
    }
  }
});

```
## Options

- **maxWidth**
  - Maximum width of images (in pixels)
- **quality** 
  - Image quality range: 0.0 - 1.0
- **imageType**
  - Values: 'image/jpeg' , 'image/png' ... etc
- **debug**
  - Displays console logs: true/false

## Thanks
This project is based on [quill-image-uploader](https://github.com/NoelOConnell/quill-image-uploader), thanks mate!

