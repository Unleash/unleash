'use strict';

module.exports.fromText = it => {
    if (typeof it === 'string') {
        return JSON.parse(it);
    }
    return it;
};
