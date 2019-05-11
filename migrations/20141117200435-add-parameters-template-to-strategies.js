'use strict';

exports.up = function(db) {
    return db.schema.table('strategies', table => {
        table.json('parameters_template');
    });
};

exports.down = function(db) {
    return db.schema.table('strategies', table => {
        table.dropColumn('parameters_template');
    });
};
