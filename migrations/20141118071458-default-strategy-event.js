'use strict';

const dataToInsert = {
    type: 'strategy-created',
    // eslint-disable-next-line camelcase
    created_by: 'migration',
    data: '{"name":"default","description":"Default on or off Strategy."}',
};

exports.up = function(db) {
    return db('events').insert(dataToInsert);
};

exports.down = function(db) {
    return db('events')
        .where(dataToInsert)
        .delete();
};
