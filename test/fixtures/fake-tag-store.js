const NotFoundError = require('../../lib/error/notfound-error');

module.exports = () => {
    const _tags = [];
    return {
        getTagsByType: type => {
            const tags = _tags.filter(t => t.type === type);
            return Promise.resolve(tags);
        },
        createTag: tag => {
            _tags.push({ value: tag.value, type: tag.type });
        },
        deleteTag: tag => {
            _tags.splice(
                _tags.indexOf(
                    t => t.value === tag.value && t.type === tag.type,
                ),
                1,
            );
        },
        getAll: () => Promise.resolve(_tags),
        getTag: (type, value) => {
            const tag = _tags.find(t => t.type === type && t.value === value);
            if (tag) {
                return Promise.resolve(tag);
            }
            return Promise.reject(new NotFoundError('Could not find tag'));
        },
    };
};
