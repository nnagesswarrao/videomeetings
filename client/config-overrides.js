const webpack = require('webpack');

module.exports = function override(config, env) {
  // Add fallbacks for node modules
  config.resolve.fallback = {
    ...config.resolve.fallback,
    stream: require.resolve('stream-browserify'),
    buffer: require.resolve('buffer/'),
    util: require.resolve('util/'),
    assert: require.resolve('assert/'),
  };

  // Add buffer polyfill
  config.plugins.push(
    new webpack.ProvidePlugin({
      process: 'process/browser',
      Buffer: ['buffer', 'Buffer'],
    })
  );

  return config;
}; 