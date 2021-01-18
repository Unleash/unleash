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
            }
            return Promise.reject(new NotFoundError('Not found!'));
        },
        createStrategy: strat => _strategies.push(strat),
        updateStrategy: strat => {
            _strategies.splice(
                _strategies.indexOf(({ name }) => name === strat.name),
                1,
            );
            _strategies.push(strat);
        },
        importStrategy: strat => Promise.resolve(_strategies.push(strat)),
        dropStrategies: () => _strategies.splice(0, _strategies.length),
        deleteStrategy: strat =>
            _strategies.splice(
                _strategies.indexOf(({ name }) => name === strat.name),
                1,
            ),
    };
};
