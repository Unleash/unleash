'use strict';

const NotFoundError = require('../../lib/error/notfound-error');

module.exports = (databaseIsUp = true) => {
    const _strategies = [
        { name: 'default', editable: false, parameters: {}, deprecated: false },
    ];

    return {
        getStrategies: () => {
            if (databaseIsUp) {
                return Promise.resolve(_strategies);
            }
            return Promise.reject(new Error('No database connection'));
        },
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
        deprecateStrategy: ({ name }) => {
            const deprecatedStrat = _strategies.find(s => s.name === name);
            deprecatedStrat.deprecated = true;
            _strategies.splice(
                _strategies.indexOf(s => name === s.name),
                1,
            );
            _strategies.push(deprecatedStrat);
        },
        reactivateStrategy: ({ name }) => {
            const reactivatedStrat = _strategies.find(s => s.name === name);
            reactivatedStrat.deprecated = false;
            _strategies.splice(
                _strategies.indexOf(s => name === s.name),
                1,
            );
            _strategies.push(reactivatedStrat);
        },
    };
};
