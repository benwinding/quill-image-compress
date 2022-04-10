const path = require("path");

const isProd = process.argv.includes("production");

module.exports = [
  {
    entry: {
      "index": "./src/index.ts",
      "quill.imageCompressor": "./src/quill.imageCompressor.ts",
      demo: "./src/demo.js"
    },
    output: {
      filename: (pathData) => {
        return pathData.chunk.name === 'index' ? '[name].js' : '[name].min.js';
      },
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
    resolve: {
      extensions: [".ts", ".js"],
    },
    module: {
      rules: [
        { test: /\.ts$/, use: ["ts-loader"], exclude: /node_modules/ },
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
