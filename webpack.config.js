var webpack = require('webpack');
var nodeExternals = require('webpack-node-externals');
var path = require("path")
var TerserPlugin = require('terser-webpack-plugin');

module.exports = {
  target: 'node',
  node: {
    __dirname: false,
    __filename: false
  },
  resolve: {
	alias: {
	  "aws-sdk": path.resolve(__dirname, 'node_modules/aws-sdk'),
	  "sdkutils": path.resolve(__dirname, '_build/Tasks/Common/sdkutils'),
	  "beanstalkutils": path.resolve(__dirname, '_build/Tasks/Common/beanstalkutils'),
	}
  },
  externals: {
    "vsts-task-lib/task": 'require("vsts-task-lib/task")'
  },
  optimization: {
    minimizer: [new TerserPlugin({cache: true, parallel: true, sourceMap: true})],
  }
};
