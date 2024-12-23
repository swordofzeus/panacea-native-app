const createExpoWebpackConfigAsync = require('@expo/webpack-config');

module.exports = async function (env, argv) {
  const config = await createExpoWebpackConfigAsync(env, argv);

  // Alias `victory-native` to `victory` for web builds
  config.resolve.alias['victory-native'] = 'victory';

  return config;
};
