// docs: http://webpack.github.io/docs/configuration.html
'use strict';

const path = require('path');
const webpack = require('webpack');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const UglifyJsPlugin = require('uglifyjs-webpack-plugin');
const OptimizeCssAssetsPlugin = require('optimize-css-assets-webpack-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const devMode = process.env.NODE_ENV !== 'production';
const mode = process.env.NODE_ENV === 'production' ? 'production' : 'development';
const entry = ['whatwg-fetch', './src/index'];
const plugins = [
    new MiniCssExtractPlugin({
        // Options similar to the same options in webpackOptions.output
        // both options are optional
        filename: 'bundle.css',
    }),
    new webpack.DefinePlugin({
        'process.env': {
            NODE_ENV: JSON.stringify(process.env.NODE_ENV || 'development'),
        },
    }),
    new webpack.optimize.ModuleConcatenationPlugin(),
    new CleanWebpackPlugin(),
];

if (devMode) {
    entry.push('webpack-dev-server/client?http://localhost:3000');
    entry.push('webpack/hot/only-dev-server');
    plugins.push(new webpack.HotModuleReplacementPlugin());
}

module.exports = {
    mode,
    entry,

    resolve: {
        extensions: ['.scss', '.css', '.js', '.jsx', '.json'],
    },

    output: {
        path: path.join(__dirname, 'dist/public'),
        filename: 'bundle.js',
        publicPath: '/static/',
    },

    optimization: {
        minimizer: [
            new UglifyJsPlugin({
                uglifyOptions: {
                    output: {
                        comments: false,
                    },
                },
            }),
            new OptimizeCssAssetsPlugin({
                cssProcessor: require('cssnano'),
                cssProcessorOptions: { discardComments: { removeAll: true } },
                canPrint: true,
            }),
        ],
    },

    module: {
        rules: [
            {
                test: /\.jsx?$/,
                exclude: /node_modules/,
                loader: 'babel-loader',
                include: path.join(__dirname, 'src'),
            },
            {
                test: /(\.scss)$/,
                use: [
                    { loader: devMode ? 'style-loader' : MiniCssExtractPlugin.loader },
                    {
                        loader: 'css-loader',
                        options: {
                            sourceMap: true,
                            modules: true,
                            importLoaders: 1,
                            localIdentName: '[name]__[local]___[hash:base64:5]',
                        },
                    },
                    {
                        loader: 'sass-loader',
                        options: {
                            // data: '@import "theme/_config.scss";',
                            includePaths: [path.resolve(__dirname, './src')],
                        },
                    },
                ],
            },
            {
                test: /(\.css)$/,
                use: [{ loader: devMode ? 'style-loader' : MiniCssExtractPlugin.loader }, { loader: 'css-loader' }],
            },
        ],
    },

    plugins,

    devtool: 'source-map',

    devServer: {
        proxy: {
            '/api': {
                target: process.env.UNLEASH_API || 'http://localhost:4242',
                changeOrigin: true,
                secure: false,
            },
        },
        port: process.env.PORT || 3000,
    },
};
