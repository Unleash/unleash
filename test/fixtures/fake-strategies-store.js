'use strict';

const NotFoundError = require('../../lib/error/notfound-error');

module.exports = () => {
    const _strategies = [{ name: 'default', editable: false, parameters: {} }];

    return {
        getStrategies: () => Promise.resolve(_strategies),
        getEditableStrategies: () =>
            Promise.resolve(_strategies.filter(s => s.editable)),
        getStrategy: name => {
            const strategy = _strategies.find(s => s.name === name);
            if (strategy) {
                return Promise.resolve(strategy);
            } else {
                return Promise.reject(new NotFoundError('Not found!'));
            }
        },
        addStrategy: strat => _strategies.push(strat),
    };
};
