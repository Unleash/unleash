'use strict';

module.exports = () => {
    const _featureTags = {};
    return {
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
