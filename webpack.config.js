const path = require('path');
const nodeExternals = require('webpack-node-externals')
const isProd = process.env.NODE_ENV === 'production'

module.exports = {
  entry: {
    index: './src/index.ts',
    'adapters/JsonStorageAdapter': './src/adapters/JsonStorageAdapter.ts',
    'adapters/InMemoryAdapter': './src/adapters/InMemoryAdapter.ts',
    'adapters/LocalStorageAdapter': './src/adapters/LocalStorageAdapter.ts',
    'adapters/FastStorageAdapter': './src/adapters/FastStorageAdapter.ts'
  },
  externals: [nodeExternals({
    whitelist: ['jsonschema']
  })],
  devtool: isProd ? undefined : 'inline-source-map',
  mode: isProd ? 'production' : 'development',
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env']
          }
        },
        exclude: /node_modules/
      },
    ]
  },
  node: { fs: 'empty' },
  resolve: {
    extensions: [ '.tsx', '.ts', '.js' ],
  },
  target: 'node',
  output: {
    filename: '[name].js',
    path: path.resolve(__dirname, 'dist'),
    libraryTarget: 'umd'
  }
};
