'use strict';

const _strategies = [{ name: 'default', parameters: {} }];


module.exports = {
    getStrategies: () => Promise.resolve(_strategies),
    addStrategy: (strat) => _strategies.push(strat),
    reset: () => {
        _strategies.length = 0;
    },
};
