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
            return Promise.reject(new Error('could not find toggle'));
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
        updateFeature: updatedFeature => {
            _features.splice(
                _features.indexOf(f => f.name === updatedFeature.name),
                1,
            );
            _features.push(updatedFeature);
        },
        getFeatures: () => Promise.resolve(_features),
        getFeaturesClient: () => Promise.resolve(_features),
        createFeature: feature => _features.push(feature),
        getArchivedFeatures: () => Promise.resolve(_archive),
        addArchivedFeature: feature => _archive.push(feature),
        reviveFeature: feature => {
            const revived = _archive.find(f => f.name === feature.name);
            _archive.splice(
                _archive.indexOf(f => f.name === feature.name),
                1,
            );
            _features.push(revived);
        },
        lastSeenToggles: (names = []) => {
            names.forEach(name => {
                const toggle = _features.find(f => f.name === name);
                if (toggle) {
                    toggle.lastSeenAt = new Date();
                }
            });
        },
        dropFeatures: () => {
            _features.splice(0, _features.length);
            _archive.splice(0, _archive.length);
        },
        importFeature: feat => Promise.resolve(_features.push(feat)),
    };
};
