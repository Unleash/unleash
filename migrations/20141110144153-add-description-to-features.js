'use strict';

exports.up = function(db) {
    return db.schema.table('features', table => {
        table.text('description');
    });
};

exports.down = function(db) {
    return db.schema.table('features', table => {
        table.dropColumn('description');
    });
};
