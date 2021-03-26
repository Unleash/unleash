const NotFoundError = require('../../lib/error/notfound-error');

module.exports = () => {
    const _tagTypes = [];
    return {
        getTagType: async name => {
            const tag = _tagTypes.find(t => t.name === name);
            if (tag) {
                return Promise.resolve(tag);
            }
            return Promise.reject(new NotFoundError('Could not find tag type'));
        },
        createTagType: async tag => {
            _tagTypes.push(tag);
        },
        getAll: () => Promise.resolve(_tagTypes),
        bulkImport: tagTypes => {
            tagTypes.forEach(tagType => _tagTypes.push(tagType));
            return Promise.resolve(_tagTypes);
        },
        dropTagTypes: () => {
            _tagTypes.splice(0, _tagTypes.length);
            return Promise.resolve();
        },
        exists: name => Promise.resolve(_tagTypes.some(t => t.name === name)),
    };
};
