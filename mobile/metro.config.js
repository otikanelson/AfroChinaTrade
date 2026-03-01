const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const config = getDefaultConfig(__dirname);

// Ensure React is resolved from the root node_modules only
config.resolver.nodeModulesPaths = [
  path.resolve(__dirname, 'node_modules'),
  path.resolve(__dirname, '../node_modules'),
];

// Force React to resolve from root to avoid multiple copies
config.resolver.extraNodeModules = {
  'react': path.resolve(__dirname, '../node_modules/react'),
  'react-dom': path.resolve(__dirname, '../node_modules/react-dom'),
  'react-native': path.resolve(__dirname, '../node_modules/react-native'),
};

module.exports = config;
