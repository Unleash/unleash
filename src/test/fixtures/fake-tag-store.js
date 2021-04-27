const NotFoundError = require('../../lib/error/notfound-error');

module.exports = (databaseIsUp = true) => {
    const _tags = [];
    return {
        getTagsByType: type => {
            if (!databaseIsUp) {
                return Promise.reject(new Error('No database connection'));
            }
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
        getAll: () => {
            if (!databaseIsUp) {
                return Promise.reject(new Error('No database connection'));
            }
            return Promise.resolve(_tags);
        },
        getTag: (type, value) => {
            const tag = _tags.find(t => t.type === type && t.value === value);
            if (tag) {
                return Promise.resolve(tag);
            }
            return Promise.reject(new NotFoundError('Could not find tag'));
        },
        bulkImport: tags => {
            tags.forEach(tag => _tags.push(tag));
            return Promise.resolve(_tags);
        },
        dropTags: () => {
            _tags.splice(0, _tags.length);
            return Promise.resolve();
        },
        exists: tag =>
            Promise.resolve(
                _tags.some(t => t.type === tag.type && t.value === tag.value),
            ),
    };
};
