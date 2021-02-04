'use strict';

module.exports = () => {
    const _addons = [];

    return {
        insert: async addon => {
            const a = { id: _addons.length, ...addon };
            _addons.push(a);
            return a;
        },
        update: async (id, value) => {
            _addons[id] = value;
            Promise.resolve(value);
        },
        delete: async id => {
            _addons.splice(id, 1);
            Promise.resolve();
        },
        get: async id => {
            return _addons[id];
        },
        getAll: () => Promise.resolve(_addons),
    };
};
