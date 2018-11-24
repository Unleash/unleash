'use strict';

const filter = (key, value) => {
    if (!key || !value) return array => array;
    return array => array.filter(item => item[key].startsWith(value));
};

module.exports = {
    filter,
};
