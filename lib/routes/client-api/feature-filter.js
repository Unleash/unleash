'use strict';

function enabledFilter(query) {
    return toggle => {
        if (query.enabled) {
            const enabled = query.enabled === 'true';
            return toggle.enabled === enabled;
        } else {
            return true;
        }
    };
}

function nameFilter(query) {
    return toggle => {
        if (query.name) {
            return toggle.name.startsWith(query.name);
        } else {
            return true;
        }
    };
}

function makeQueryFilter(query) {
    return function(featureToggles) {
        return featureToggles
            .filter(enabledFilter(query))
            .filter(nameFilter(query));
    };
}

module.exports.makeQueryFilter = makeQueryFilter;
