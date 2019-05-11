'use strict';

const Promise = require('bluebird');

exports.up = function(knex) {
    const archive = knex('events')
        .where('type', 'feature-archive')
        .update({ type: 'feature-archived' });
    const revive = knex('events')
        .where('type', 'feature-revive')
        .update({ type: 'feature-revived' });
    return Promise.all([archive, revive]);
};

exports.down = function(knex) {
    const archived = knex('events')
        .where('type', 'feature-archived')
        .update({ type: 'feature-archive' });
    const revived = knex('events')
        .where('type', 'feature-revived')
        .update({ type: 'feature-revive' });
    return Promise.all([archived, revived]);
};
