const path = require('path');
const webpack = require('webpack');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');

const MonacoEditorSrc = path.join(__dirname, 'node_modules', 'react-monaco-editor');
const VSMonacoEditorSrc = path.join(__dirname, 'node_modules', 'monaco-editor', 'min', 'vs');

let distDir = path.resolve(__dirname, 'dist');

module.exports = {
  mode: 'production',
  entry: {
    jsx: './src/index.tsx',
  },
  output: {
    path: distDir,
    filename: 'index.js',
    publicPath: './',
  },
  resolve: {
    extensions: ['.ts', '.tsx', '.js'],
    alias: { 'react-monaco-editor': MonacoEditorSrc },
    fallback: {
      path: require.resolve('path-browserify'),
      buffer: require.resolve('buffer/'),
    },
  },
  module: {
    rules: [
      {
        test: /webworkerscript\.js$/,
        use: { loader: 'worker-loader' },
      },
      {
        test: /\.tsx?$/,
        use: [
          {
            loader: 'babel-loader',
            options: {
              presets: ['@babel/preset-env', '@babel/preset-react'],
            },
          },
          'ts-loader',
        ],
      },
      {
        test: /\.jsx?$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env', '@babel/preset-react'],
          },
        },
      },
    ],
  },
  devServer: {
    allowedHosts: 'all',
    static: [
      {
        directory: distDir,
        publicPath: '/',
      },
    ],
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: 'public/index.html',
    }),
    new CopyWebpackPlugin({
      patterns: [
        { from: VSMonacoEditorSrc, to: 'vs' },
        { from: 'public/index.css', to: 'index.css' },
        { from: 'public/lean_logo.svg', to: 'lean_logo.svg' },
        { from: 'public/display-goal-light.svg', to: 'display-goal-light.svg' },
        { from: 'public/display-list-light.svg', to: 'display-list-light.svg' },
      ],
    }),
    new webpack.ProvidePlugin({
      Buffer: ['buffer', 'Buffer'],
    }),
  ],
  externals: {},
};
