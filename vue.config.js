const { defineConfig } = require("@vue/cli-service");
const fs = require("fs");
const path = require("path");

const glob = require("glob");
const TerserWebpackPlugin = require("terser-webpack-plugin");
const CSSMinimizerWebpackPlugin = require("css-minimizer-webpack-plugin");
const { PurgeCSSPlugin } = require("purgecss-webpack-plugin");
const ImageMinimizerPlugin = require("image-minimizer-webpack-plugin");

const CompressionWebpackPlugin = require("compression-webpack-plugin");

const resolve = (dir) => path.resolve(__dirname, dir);

const env = process.env.NODE_ENV;
console.log("process.env.NODE_ENV: ", env);
// console.log(glob.sync(`${resolve("./src")}/**/*`, { nodir: true }));

const versionJSON = require("./src/utils/version.json");
// 生成版本、编译时间
if (
  env === "production" &&
  versionJSON.version !== process.env.VUE_APP_VERSION
) {
  const versionJSON = {
    compileTime: new Date().getTime(),
    version: process.env.VUE_APP_VERSION,
  };
  fs.writeFile("./src/utils/version.json", JSON.stringify(versionJSON), () => {
    console.log("新版本号生成成功", versionJSON);
  });
}

module.exports = defineConfig({
  transpileDependencies: true,
  publicPath: "/",
  // assetsDir: "static",
  productionSourceMap: false,
  configureWebpack: (config) => {
    if (env === "production") {
      config.mode = "production";

      config.optimization = {
        // // 导入模块时，分析模块中哪些函数有被使用，哪些函数没有被使用
        // usedExports: true, // 默认开启

        // 设置chunkId的算法
        // development: named
        // production: deterministic
        chunkIds: "deterministic",

        // runtime的代码是否抽取到单独的包中
        runtimeChunk: {
          name: "runtime",
        },

        // 默认的
        // splitChunks: {
        //   cacheGroups: {
        //     defaultVendors: {
        //       name: "chunk-vendors",
        //       test: /[\\/]node_modules[\\/]/,
        //       priority: -10,
        //       // initial(只打包静态引入的资源，并且生成了多个bundle文件)
        //       chunks: "initial",
        //     },
        //     common: {
        //       name: "chunk-common",
        //       minChunks: 2,
        //       priority: -20,
        //       chunks: "all",
        //       reuseExistingChunk: true,
        //     },
        //   },
        // },
        splitChunks: {
          chunks: "all",
          cacheGroups: {
            elementUI: {
              name: "element-ui",
              test: /[\\/]node_modules[\\/](element-ui)[\\/]/,
              priority: 10,
              reuseExistingChunk: true,
            },
            // vendor: {
            //   name: "vendors",
            //   test: /[\\/]node_modules[\\/]/,
            //   priority: -10,
            // },
          },
        },

        // minimize: true,
        minimizer: [
          // js压缩
          new TerserWebpackPlugin({
            // 不抽取第三方库的注释
            extractComments: false,
            terserOptions: {
              compress: {
                drop_console: true,
                drop_debugger: true,
              },
            },
          }),
          // css压缩
          new CSSMinimizerWebpackPlugin(),
          // 图片压缩(注意安装两个包) npm install image-minimizer-webpack-plugin imagemin --save-dev
          new ImageMinimizerPlugin({
            minimizer: {
              implementation: ImageMinimizerPlugin.imageminMinify,
              options: {
                plugins: [
                  // "imagemin-gifsicle",
                  // "imagemin-jpegtran",
                  // "imagemin-optipng",
                  // "imagemin-svgo",
                  ["gifsicle", { interlaced: true }],
                  ["jpegtran", { progressive: true }],
                  ["optipng", { optimizationLevel: 5 }],
                  [
                    "svgo",
                    {
                      plugins: [
                        {
                          name: "preset-default",
                          params: {
                            overrides: {
                              removeViewBox: false,
                              addAttributesToSVGElement: {
                                params: {
                                  attributes: [
                                    { xmlns: "http://www.w3.org/2000/svg" },
                                  ],
                                },
                              },
                            },
                          },
                        },
                      ],
                    },
                  ],
                ],
              },
            },
            // 独立使用插件，不用loader
            loader: false,
          }),
        ],
      };

      // config.plugins.push(
      //   new PurgeCSSPlugin({
      //     paths: glob.sync(`${resolve("./src")}/**/*`, { nodir: true }),
      //     // 设置安全组，下面匹配的不会擦除
      //     safelist: function () {
      //       return {
      //         standard: [
      //           "html",
      //           /-(leave|enter|appear)(|-(to|from|active))$/,
      //           /^(?!(|.*?:)cursor-move).+-move$/,
      //           /^router-link(|-exact)-active$/,
      //           /data-v-.*/,
      //           /class/,
      //         ],
      //       };
      //     },
      //   })
      // );
    } else {
      config.mode = "development";
    }
  },
  chainWebpack: (config) => {
    if (env === "production") {
      // 配置项必须是一个数组
      // css tree-shaking
      config.plugin("purgeCss").use(PurgeCSSPlugin, [
        {
          paths: glob.sync(`${resolve("./src")}/**/*`, { nodir: true }),
          // 设置安全组，一下匹配的不会擦除
          safelist: function () {
            return {
              standard: [
                "html",
                /-(leave|enter|appear)(|-(to|from|active))$/,
                /^(?!(|.*?:)cursor-move).+-move$/,
                /^router-link(|-exact)-active$/,
                /data-v-.*/,
                /class/,
              ],
            };
          },
        },
      ]);
      // 文件压缩
      config.plugin("compression").use(CompressionWebpackPlugin, [
        {
          test: /\.js|\.html|\.css/,
          algorithm: "gzip",
          threshold: 10240, // 超出10kb进行压缩
          // deleteOriginalAssets: false, // 是否删除源文件
        },
      ]);
    }
  },
});
