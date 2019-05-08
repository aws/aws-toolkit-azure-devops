var webpack = require('webpack');
var path = require("path")
var nodeExternals = require('webpack-node-externals');
var TerserPlugin = require('terser-webpack-plugin');

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
	  "sdkutils": path.resolve(__dirname, '_build/Tasks/Common/sdkutils'),
	  "beanstalkutils": path.resolve(__dirname, '_build/Tasks/Common/beanstalkutils'),
	}
  },
  optimization: {
    minimizer: [new TerserPlugin({cache: true, parallel: true, sourceMap: true})],
  },
  plugins: [
    new webpack.LoaderOptionsPlugin({
      test: /\.(js|jsx)$/,
      options: {
        rules: [
          {
            exclude: /(node_modules)/,
            use: {
              loader: 'babel-loader?cacheDirectory=true',
              options: {
                presets: ['env']
              }
            }
          }
        ]
      }
    })
  ]
};
