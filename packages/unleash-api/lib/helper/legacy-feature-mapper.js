'use strict';

function addOldFields (feature) {
    const modifiedFeature = Object.assign({}, feature);
    modifiedFeature.strategy = feature.strategies[0].name;
    modifiedFeature.parameters = Object.assign({}, feature.strategies[0].parameters);
    return modifiedFeature;
}

function isOldFomrat (feature) {
    return feature.strategy && !feature.strategies;
}

function toNewFormat (feature) {
    if (isOldFomrat(feature)) {
        return {
            name: feature.name,
            description: feature.description,
            enabled: feature.enabled,
            strategies: [
                {
                    name: feature.strategy,
                    parameters: Object.assign({}, feature.parameters),
                },
            ],
        };
    }
    return feature;
}

module.exports = { addOldFields, toNewFormat };
