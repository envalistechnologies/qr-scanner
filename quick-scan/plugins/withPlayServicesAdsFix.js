const { withAppBuildGradle, withProjectBuildGradle } = require('expo/config-plugins');

/**
 * Expo config plugin to resolve Kotlin metadata incompatibilities caused by
 * Google Play Services Ads 25.4.0 (which was compiled with Kotlin 2.3.0 metadata).
 * 
 * Pins com.google.android.gms:play-services-ads to 25.3.0 (released May 21, 2026,
 * the last release compiled before Google bumped internal Kotlin requirements in 25.4.0).
 */
const withPlayServicesAdsFix = (config) => {
  // Inject resolutionStrategy into app/build.gradle
  config = withAppBuildGradle(config, (config) => {
    const forceBlock = `
configurations.all {
    resolutionStrategy {
        force "com.google.android.gms:play-services-ads:25.3.0"
    }
}
`;
    if (!config.modResults.contents.includes('play-services-ads:25.3.0')) {
      config.modResults.contents += '\n' + forceBlock;
    }
    return config;
  });

  // Also inject into root build.gradle allprojects block so library submodules
  // like :react-native-google-mobile-ads also respect the force rule
  config = withProjectBuildGradle(config, (config) => {
    const rootForceBlock = `
allprojects {
    configurations.all {
        resolutionStrategy {
            force "com.google.android.gms:play-services-ads:25.3.0"
        }
    }
}
`;
    if (!config.modResults.contents.includes('play-services-ads:25.3.0')) {
      config.modResults.contents += '\n' + rootForceBlock;
    }
    return config;
  });

  return config;
};

module.exports = withPlayServicesAdsFix;
