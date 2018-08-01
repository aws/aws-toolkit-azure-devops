var webpack = require('webpack');
var nodeExternals = require('webpack-node-externals');
var UglifyJSPlugin = require('uglifyjs-webpack-plugin');

module.exports = {
  target: 'node',
  node: {
    __dirname: false,
    __filename: false
  },
  externals: [
    nodeExternals({
      whitelist: function (moduleName) {
        return !moduleName.startsWith('vsts-task-lib');
      }
    })
  ],
  plugins: [
    new webpack.LoaderOptionsPlugin({
      test: /\.(js|jsx)$/,
      options: {
        rules: [
          {
            exclude: /(node_modules)/,
            use: {
              loader: 'babel-loader',
              options: {
                presets: ['env']
              }
            }
          }
        ]
      }
    }),
    new UglifyJSPlugin({
      test: /\.js($|\?)/i,
      sourceMap: true,
      uglifyOptions: {
        compress: true
      }
    }),
  ]
};