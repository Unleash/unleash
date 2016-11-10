'use strict';

const _features = [];

module.exports = {
    getFeatures: () => Promise.resolve(_features),
    addFeature: (feature) => _features.push(feature),
    reset: () => {
        _features.lengyh = 0;
    },
};
