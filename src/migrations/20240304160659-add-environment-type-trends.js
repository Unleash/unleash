'use strict';

exports.up = function(db, cb) {
    db.runSql(
        `
        CREATE TABLE IF NOT EXISTS environment_type_trends (
            id VARCHAR(255) NOT NULL,
            environment_type VARCHAR(255) NOT NULL,
            total_updates INTEGER NOT NULL,
            PRIMARY KEY (id, environment_type)
        );`,
        cb,
    );
};

exports.down = function(db, cb) {
    db.runSql('DROP TABLE IF EXISTS environment_type_trends;', cb);
};
