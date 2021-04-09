import webpack from 'webpack';
import { logger } from '@storybook/node-logger';
import TsconfigPathsPlugin from 'tsconfig-paths-webpack-plugin';

import { findAngularProject, readAngularWorkspaceConfig } from './angular-read-workspace';
import {
  AngularCliWebpackConfig,
  extractAngularCliWebpackConfig,
} from './angular-devkit-build-webpack';
import { moduleIsAvailable } from './utils/module-is-available';
import { filterOutStylingRules } from './utils/filter-out-styling-rules';

export async function webpackFinal(baseConfig: webpack.Configuration) {
  const dirToSearch = process.cwd();

  if (!moduleIsAvailable('@angular-devkit/build-angular')) {
    logger.info('=> Using base config because @angular-devkit/build-angular is not installed');
    return baseConfig;
  }
  logger.info('=> Loading angular-cli config');

  // Read angular workspace
  let workspaceConfig;
  try {
    workspaceConfig = await readAngularWorkspaceConfig(dirToSearch);
  } catch (error) {
    logger.error(
      `=> Could not find angular workspace config (angular.json) on this path "${dirToSearch}"`
    );
    return baseConfig;
  }

  // Find angular project
  let project;
  try {
    const fondProject = findAngularProject(workspaceConfig);
    project = fondProject.project;
    logger.info(`=> Using angular project '${fondProject.projectName}' for configuring Storybook`);
  } catch (error) {
    logger.error(`=> Could not find angular project`);
    throw error;
  }

  // Use angular-cli to get some webpack config
  let angularCliWebpackConfig;
  try {
    angularCliWebpackConfig = await extractAngularCliWebpackConfig(dirToSearch, project);
    logger.info(`=> Get angular-cli webpack config`);
  } catch (error) {
    logger.error(`=> Could not get angular cli webpack config`);
    throw error;
  }

  return mergeAngularCliWebpackConfig(angularCliWebpackConfig, baseConfig);
}

function mergeAngularCliWebpackConfig(
  { cliCommonWebpackConfig, cliStyleWebpackConfig, tsConfigPath }: AngularCliWebpackConfig,
  baseConfig: webpack.Configuration
) {
  // Don't use storybooks styling rules because we have to use rules created by @angular-devkit/build-angular
  // because @angular-devkit/build-angular created rules have include/exclude for global style files.
  const rulesExcludingStyles = filterOutStylingRules(baseConfig);

  // styleWebpackConfig.entry adds global style files to the webpack context
  const entry = [
    ...(baseConfig.entry as string[]),
    ...Object.values(cliStyleWebpackConfig.entry).reduce((acc, item) => acc.concat(item), []),
  ];

  const module = {
    ...baseConfig.module,
    rules: [...cliStyleWebpackConfig.module.rules, ...rulesExcludingStyles],
  };

  // We use cliCommonConfig plugins to serve static assets files.
  const plugins = [
    ...cliStyleWebpackConfig.plugins,
    ...cliCommonWebpackConfig.plugins,
    ...baseConfig.plugins,
  ];

  const resolve = {
    ...baseConfig.resolve,
    modules: Array.from(
      new Set([...baseConfig.resolve.modules, ...cliCommonWebpackConfig.resolve.modules])
    ),
    plugins: [
      new TsconfigPathsPlugin({
        configFile: tsConfigPath,
        mainFields: ['browser', 'module', 'main'],
      }),
    ],
  };

  return {
    ...baseConfig,
    entry,
    module,
    plugins,
    resolve,
    resolveLoader: cliCommonWebpackConfig.resolveLoader,
  };
}
