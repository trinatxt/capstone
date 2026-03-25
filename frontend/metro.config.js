const { getDefaultConfig, mergeConfig } = require('@react-native/metro-config');

/**
 * Metro configuration
 * https://reactnative.dev/docs/metro
 *
 * @type {import('@react-native/metro-config').MetroConfig}
 */
const defaultConfig = getDefaultConfig(__dirname);

const config = {
  resolver: {
    assetExts: [...defaultConfig.resolver.assetExts, 'glb', 'gltf', 'html'],
  },
  watchFolders: [],
  watcher: {
    additionalExts: [],
    watchman: {
      deferStates: [],
    },
  },
  blockList: [
    /frontend\/android\/app\/\.cxx\/.*/,
    /frontend\/android\/build\/.*/,
    /frontend\/android\/app\/build\/.*/,
  ],
};

module.exports = mergeConfig(defaultConfig, config);
