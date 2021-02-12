'use strict';

const NotFoundError = require('../../lib/error/notfound-error');

module.exports = () => {
    let _contextFields = [
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
            }
            return Promise.reject(NotFoundError);
        },
        create: contextField => _contextFields.push(contextField),
        update: field => {
            _contextFields = _contextFields.map(c =>
                c.name === field.name ? field : c,
            );
        },
        delete: name => {
            _contextFields = _contextFields.filter(c => c.name !== name);
        },
    };
};
