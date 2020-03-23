const path = require("path");

const isProd = process.argv.includes("production");

module.exports = [
  {
    entry: {
      "quill.imageCompressor": "./src/quill.imageCompressor.js",
      demo: "./src/demo.js"
    },
    output: {
      filename: "[name].min.js",
      path: path.resolve(__dirname, "dist"),
      libraryTarget: "umd",
      publicPath: "/dist/"
    },
    devServer: {
      contentBase: "./src"
    },
    externals: {
      quill: "Quill"
    },
    devtool: isProd ? undefined : "inline-source-map",
    module: {
      rules: [
        {
          test: /\.js$/,
          exclude: /node_modules/,
          use: {
            loader: "babel-loader"
          }
        }
      ]
    }
  }
];
