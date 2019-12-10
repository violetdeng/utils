const webpack = require("webpack")

module.exports = {
  css: {
    loaderOptions: {
      sass: {
        prependData: `
          @import "@/assets/styles/_variable.scss";
        `
      }
    }
  },
  configureWebpack: {
    plugins: [
      new webpack.ProvidePlugin({
        _: 'lodash'
      })
    ]
  },
  devServer: {
    host: "localhost",
    proxy: {
      "/api": {
        target: "http://violetdeng.com:3000",
        pathRewrite: {
          "^/api": ""
        }
      }
    }
  },
  runtimeCompiler: true
}
