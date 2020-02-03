var path = require('path')
var TerserPlugin = require('terser-webpack-plugin')

module.exports = {
    target: 'node',
    node: {
        __dirname: false,
        __filename: false
    },
    resolve: {
        alias: {
            'aws-sdk': path.resolve(__dirname, 'node_modules/aws-sdk'),
            Common: path.resolve(__dirname, '_build/Tasks/Common')
        }
    },
    externals: {
        'azure-pipelines-task-lib/task': 'require("azure-pipelines-task-lib/task")'
    },
    optimization: {
        minimizer: [new TerserPlugin({ cache: true, parallel: true, sourceMap: true })]
    }
}
