const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Disable Metro's watcher - use in-memory bundling
config.server = {
  ...config.server,
  // Use a simple watcher that doesn't open many files
  experimentalWatchman: false,
};

module.exports = config;