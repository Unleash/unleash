'use strict';

module.exports = () => {
    const _features = [];
    const _archive = [];
    return {
        getFeature: name => {
            const toggle = _features.find(f => f.name === name);
            if (toggle) {
                return Promise.resolve(toggle);
            } else {
                return Promise.reject();
            }
        },
        getFeatures: () => Promise.resolve(_features),
        hasFeatureName: () => Promise.resolve(false),
        addFeature: feature => _features.push(feature),
        getArchivedFeatures: () => Promise.resolve(_archive),
        addArchivedFeature: feature => _archive.push(feature),
    };
};
