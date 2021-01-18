'use strict';

const NotFoundError = require('../../lib/error/notfound-error');

module.exports = () => {
    const _tags = [];
    const _featureTags = {};
    return {
        getAllOfType: type => {
            const tags = _tags.filter(t => t.type === type);
            return Promise.resolve(tags);
        },
        addTag: tag => {
            _tags.push({ value: tag.value, type: tag.type });
        },
        removeTag: tag => {
            _tags.splice(
                _tags.indexOf(
                    t => t.value === tag.value && t.type === tag.type,
                ),
                1,
            );
        },
        getTags: () => Promise.resolve(_tags),
        getTagByTypeAndValue: (type, value) => {
            const tag = _tags.find(t => t.type === type && t.value === value);
            if (tag) {
                return Promise.resolve(tag);
            }
            return Promise.reject(new NotFoundError('Could not find tag'));
        },
        tagFeature: event => {
            _featureTags[event.featureName] =
                _featureTags[event.featureName] || [];
            const tag = {
                value: event.value,
                type: event.type,
            };
            _featureTags[event.featureName].push(tag);
            return tag;
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
