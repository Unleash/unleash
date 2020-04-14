'use strict';

module.exports = () => {
    const _features = [];
    const _archive = [];
    return {
        getFeature: name => {
            const toggle = _features.find(f => f.name === name);
            if (toggle) {
                return Promise.resolve(toggle);
            }
            return Promise.reject();
        },
        hasFeature: name => {
            const toggle = _features.find(f => f.name === name);
            const archived = _archive.find(f => f.name === name);
            if (toggle) {
                return Promise.resolve({ name, archived: false });
            }
            if (archived) {
                return Promise.resolve({ name, archived: true });
            }
            return Promise.reject();
        },
        getFeatures: () => Promise.resolve(_features),
        addFeature: feature => _features.push(feature),
        getArchivedFeatures: () => Promise.resolve(_archive),
        addArchivedFeature: feature => _archive.push(feature),
    };
};
