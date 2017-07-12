var nodeExternals = require('webpack-node-externals');

module.exports = {
  target: 'node',
  node: {
    __dirname: false,
    __filename: false
  },
  externals: [
    nodeExternals({
      whitelist: [/^aws-sdk/]
    })
  ]
 };