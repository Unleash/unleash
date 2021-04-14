'use strict';

module.exports = (databaseIsUp = true) => {
    const _features = [];
    const _archive = [];
    const _featureTags = [];

    return {
        getFeature: name => {
            if (!databaseIsUp) {
                return Promise.reject(new Error('No database connection'));
            }
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
            if (!databaseIsUp) {
                return Promise.reject(new Error('No database connection'));
            }
            if (query) {
                const activeQueryKeys = Object.keys(query).filter(
                    t => query[t],
                );
                const filtered = _features.filter(feature =>
                    activeQueryKeys.every(key => {
                        if (key === 'namePrefix') {
                            return feature.name.indexOf(query[key]) > -1;
                        }
                        if (key === 'tag') {
                            return query[key].some(tagQuery =>
                                _featureTags
                                    .filter(t => t.featureName === feature.name)
                                    .some(
                                        tag =>
                                            tag.tagType === tagQuery[0] &&
                                            tag.tagValue === tagQuery[1],
                                    ),
                            );
                        }
                        return query[key].some(v => v === feature[key]);
                    }),
                );
                return Promise.resolve(filtered);
            }
            return Promise.resolve(_features);
        },
        tagFeature: (featureName, tag) => {
            _featureTags.push({
                featureName,
                tagType: tag.type,
                tagValue: tag.value,
            });
        },
        untagFeature: event => {
            const index = _featureTags.findIndex(
                f =>
                    f.featureName === event.featureName &&
                    f.tagType === event.type &&
                    f.tagValue === event.value,
            );
            _featureTags.splice(index, 1);
        },
        getAllTagsForFeature: featureName =>
            Promise.resolve(
                _featureTags
                    .filter(f => f.featureName === featureName)
                    .map(t => ({
                        type: t.tagType,
                        value: t.tagValue,
                    })),
            ),
        getAllFeatureTags: () => Promise.resolve(_featureTags),
        importFeatureTags: tags => {
            tags.forEach(tag => {
                _featureTags.push(tag);
            });
            return Promise.resolve(_featureTags);
        },
        dropFeatureTags: () => {
            _featureTags.splice(0, _featureTags.length);
            return Promise.resolve();
        },
    };
};
