const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const { CleanWebpackPlugin } = require("clean-webpack-plugin");
const ManifestPlugin = require("webpack-manifest-plugin");
const webpack = require("webpack");

const Pages = { index: "./src/index/index.ts", login: "./src/login/index.ts" };
const htmlTemplate = function() {
  let htmlArr = [];
  for (let i of Reflect.ownKeys(Pages)) {
    let template = new HtmlWebpackPlugin({
      filename: `${i}.html`,
      template: `./src/${i}/html/${i}.html`,
      chunksSortMode: "none",
      entry: [i]
    });
    htmlArr.push(template);
  }
  return htmlArr;
};

module.exports = {
  entry: Pages,
  output: {
    filename: chunkData => {
      try {
        let path = "";
        for (let name of Reflect.ownKeys(Pages)) {
          if (new RegExp(name).test(chunkData.chunk.name)) {
            path += name;
            break;
          }
        }
        return path === ""
          ? "otherjs/[name].[chunkhash].js"
          : `${path}/js/[name].[chunkhash].js`;
      } catch (e) {
        console.log(e);
      }
    },
    chunkFilename: "[name].[chunkhash].js",
    path: path.join(__dirname, "/dist"),
    publicPath: "/"
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        loader: ["ts-loader"]
      },
      {
        test: /\.less$/,
        use: [
          {
            loader: "style-loader"
          },
          {
            loader: "css-loader"
          },
          {
            loader: "postcss-loader"
          },
          {
            loader: "less-loader"
          }
        ]
      },
      {
        test: /.html$/,
        use: [
          {
            loader: "html-loader"
          }
        ]
      },
      {
        test: /\.(png|jpe?g|gif)$/i,
        use: [
          {
            loader: "file-loader",
            options: {
              outputPath: (url, resourcePath, context) => {
                // `resourcePath` is original absolute path to asset
                // `context` is directory where stored asset (`rootContext`) or `context` option

                // To get relative path you can use
                // const relativePath = path.relative(context, resourcePath);
                for (let item of Reflect.ownKeys(Pages)) {
                  let regexp = new RegExp(item);
                  let res = regexp.exec(resourcePath);
                  if (res !== null) {
                    let start = res.index + res[0].length + 1;
                    let end = resourcePath.indexOf("\\", start);
                    let flag = resourcePath.slice(start, end);
                    switch (flag) {
                      case "img":
                        return `${item}/imgs/${url}`;
                      case "css":
                        return `${item}/css/${url}`;
                    }
                  }
                }

                return `other_file/${url}`;
              }
            }
          }
        ]
      }
    ]
  },
  plugins: [
    new CleanWebpackPlugin(),
    ...htmlTemplate(),
    // new ManifestPlugin(),
    new webpack.HashedModuleIdsPlugin()
  ],
  optimization: {
    splitChunks: {
      chunks: "all"
      // minChunks: 2
    },
    runtimeChunk: true
  },
  externals: {},
  resolve: {
    extensions: [".ts", ".tsx", ".js"],
    alias: {
      api: path.resolve(__dirname, "src/api"),
      components: path.resolve(__dirname, "src/components"),
      interface: path.resolve(__dirname, "src/redux/interface"),
      rootstate: path.resolve(__dirname, "src/state")
    }
  }
};
