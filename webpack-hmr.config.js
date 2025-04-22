// webpack-hmr.config.js
const { merge } = require('webpack-merge');
const path = require('path');

module.exports = (config, options) =>
    merge(config, {
        watchOptions: {
            poll: 1000,             // опрашивать файлы каждые 1 с
            aggregateTimeout: 300,  // ждать 300 мс после изменений, прежде чем билдить
            ignored: /node_modules/,
        },
    });
