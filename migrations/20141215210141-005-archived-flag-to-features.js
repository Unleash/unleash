'use strict';

exports.up = function(db) {
    return db.schema.table('features', table => {
        table
            .integer('archived')
            .notNullable()
            .defaultTo(0);
    });
};

exports.down = function(db) {
    return db.schema.table('features', table => {
        table.dropColumn('archived');
    });
};
