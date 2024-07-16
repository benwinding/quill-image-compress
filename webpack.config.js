const path = require("path");
const TerserPlugin = require("terser-webpack-plugin");

const isProd = process.argv.includes("production");

/**
 * @type {import('webpack').Configuration}
 */
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
      port: 8001,
      hot: true,
      static: {
        directory: path.join(__dirname, 'src'),
        serveIndex: true,
      },
      devMiddleware: {
        writeToDisk: true,
      },
    },
    externals: {
      quill: "Quill"
    },
    devtool: isProd ? undefined : "inline-source-map",
    resolve: {
      extensions: [".ts", ".js"],
    },
    optimization: {
      minimize: true,
      minimizer: [
        new TerserPlugin({
          extractComments: true,
          parallel: true,
        }),
      ],
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
