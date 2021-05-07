const presetReact = require('@babel/preset-react').default;
const presetCRA = require('babel-preset-react-app');

module.exports = {
    babel: {
        loaderOptions: (babelLoaderOptions, { env, paths }) => {
            const origBabelPresetReactAppIndex = babelLoaderOptions.presets.findIndex(
                preset => {
                    return preset[0].includes('babel-preset-react-app');
                }
            );

            if (origBabelPresetReactAppIndex === -1) {
                return babelLoaderOptions;
            }

            const overridenBabelPresetReactApp = (...args) => {
                const babelPresetReactAppResult = presetCRA(...args);
                const origPresetReact = babelPresetReactAppResult.presets.find(
                    preset => {
                        return preset[0] === presetReact;
                    }
                );
                Object.assign(origPresetReact[1], {
                    importSource: '@welldone-software/why-did-you-render',
                });
                return babelPresetReactAppResult;
            };

            babelLoaderOptions.presets[
                origBabelPresetReactAppIndex
            ] = overridenBabelPresetReactApp;

            return babelLoaderOptions;
        },
    },
};
