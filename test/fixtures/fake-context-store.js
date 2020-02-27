'use strict';

const NotFoundError = require('../../lib/error/notfound-error');

module.exports = () => {
    const _contextFields = [
        { name: 'environment' },
        { name: 'userId' },
        { name: 'appName' },
    ];

    return {
        getAll: () => Promise.resolve(_contextFields),
        get: name => {
            const field = _contextFields.find(c => c.name === name);
            if (field) {
                return Promise.resolve(field);
            } else {
                return Promise.reject(NotFoundError);
            }
        },
        create: contextField => _contextFields.push(contextField),
    };
};
