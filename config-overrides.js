
const webpack = require('webpack');

module.exports = {
    webpack: function override(config) {
        const fallback = config.resolve.fallback || {};
        Object.assign(fallback, {
            "crypto": require.resolve("crypto-browserify"),
            "stream": require.resolve("stream-browserify"),
            "assert": require.resolve("assert"),
            "http": require.resolve("stream-http"),
            "https": require.resolve("https-browserify"),
            "os": require.resolve("os-browserify"),
            "url": require.resolve("url"),
            "vm": false,
            'process/browser': require.resolve('process/browser')
        })
        config.resolve.fallback = fallback;
        config.plugins = (config.plugins || []).concat([
            new webpack.ProvidePlugin({
                process: 'process/browser',
                Buffer: ['buffer', 'Buffer']
            })
        ])
        return config;
    },

    jest: function(config) {
        // Chakra UI v2 uses package.json subpath exports (e.g. @chakra-ui/utils/context)
        // that Jest's module resolver can't locate via the exports field. Map them to the
        // CJS build so tests can import Chakra components directly.
        config.moduleNameMapper = {
            ...config.moduleNameMapper,
            '^@chakra-ui/([^/]+)/(.+)$':
                '<rootDir>/node_modules/@chakra-ui/$1/dist/cjs/$2.cjs',
        };
        return config;
    },
};