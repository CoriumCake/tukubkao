const { getDefaultConfig } = require("expo/metro-config");
const { withNativeWind } = require('nativewind/metro');
const path = require('path');

const config = getDefaultConfig(__dirname);

// Add path alias configuration
config.resolver.alias = {
  '@': path.resolve(__dirname),
};

module.exports = withNativeWind(config, { input: './global.css' });
