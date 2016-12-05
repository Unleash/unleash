'use strict';

module.exports = () => {
    const _instances = [];

    return {
        insert: () => {
            _instances.push();
            return Promise.resolve();
        },
        getAll: () => Promise.resolve(_instances),
        getApplications: () => Promise.resolve([]),
    };
};
