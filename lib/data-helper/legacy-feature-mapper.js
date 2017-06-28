'use strict';

function addOldFields(feature) {
    const modifiedFeature = Object.assign({}, feature);
    if (!feature.strategies) {
        modifiedFeature.strategies = [];
        return modifiedFeature;
    }
    if (feature.strategies[0]) {
        modifiedFeature.strategy = feature.strategies[0].name;
        modifiedFeature.parameters = Object.assign(
            {},
            feature.strategies[0].parameters
        );
    }
    return modifiedFeature;
}

function isOldFomrat(feature) {
    return feature.strategy && !feature.strategies;
}

function toNewFormat(feature) {
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
    } else {
        return {
            name: feature.name,
            description: feature.description,
            enabled: feature.enabled,
            strategies: feature.strategies,
            createdAt: feature.createdAt,
        };
    }
}

module.exports = { addOldFields, toNewFormat };
