'use strict';




module.exports = () => {
    const _strategies = [{ name: 'default', parameters: {} }];

    return {
        getStrategies: () => Promise.resolve(_strategies),
        addStrategy: (strat) => _strategies.push(strat),
    };
};
