'use strict';

module.exports = () => {
    const _features = [];
    const _archive = [];
    const _featureTags = {};

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
        archiveFeature: feature => {
            _features.slice(
                _features.indexOf(({ name }) => name === feature.name),
                1,
            );
            _archive.push(feature);
        },
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
        getFeatures: query => {
            if (query) {
                const activeQueryKeys = Object.keys(query).filter(
                    t => query[t],
                );
                const filtered = _features.filter(feature => {
                    return activeQueryKeys.every(key => {
                        if (key === 'namePrefix') {
                            return feature.name.indexOf(query[key]) > -1;
                        }
                        if (key === 'tag') {
                            return query[key].some(tag => {
                                return (
                                    _featureTags[feature.name] &&
                                    _featureTags[feature.name].some(t => {
                                        return (
                                            t.type === tag[0] &&
                                            t.value === tag[1]
                                        );
                                    })
                                );
                            });
                        }
                        return query[key].some(v => v === feature[key]);
                    });
                });
                return Promise.resolve(filtered);
            }
            return Promise.resolve(_features);
        },
        tagFeature: (featureName, tag) => {
            _featureTags[featureName] = _featureTags[featureName] || [];
            _featureTags[featureName].push(tag);
        },
        untagFeature: event => {
            const tags = _featureTags[event.featureName];
            _featureTags[event.featureName] = tags.splice(
                tags.indexOf(
                    t => t.type === event.type && t.value === event.value,
                ),
                1,
            );
        },
        getAllTagsForFeature: featureName => {
            return _featureTags[featureName] || [];
        },
    };
};
