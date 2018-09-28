var webpack = require('webpack');
var path = require("path")
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
  resolve: {
	alias: {
	  "aws-sdk": path.resolve(__dirname, 'node_modules/aws-sdk'),
	},
  },
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