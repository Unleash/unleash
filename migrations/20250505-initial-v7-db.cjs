exports.up = (knex) =>
    knex.raw('DROP TABLE IF EXISTS users, products');

exports.down = (knex) => null;
