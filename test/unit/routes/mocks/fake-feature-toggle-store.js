'use strict';


module.exports =  () => {
    const _features = [];
    return {
        getFeatures: () => Promise.resolve(_features),
        addFeature: (feature) => _features.push(feature),
    };
};
