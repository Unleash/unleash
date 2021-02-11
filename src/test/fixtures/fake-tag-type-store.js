const NotFoundError = require('../../lib/error/notfound-error');

module.exports = () => {
    const _tagTypes = {};
    return {
        getTagType: async name => {
            const tag = _tagTypes[name];
            if (tag) {
                return Promise.resolve(tag);
            }
            return Promise.reject(new NotFoundError('Could not find tag type'));
        },
        createTagType: async tag => {
            _tagTypes[tag.name] = tag;
        },
    };
};
