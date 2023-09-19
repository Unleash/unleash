'use strict';

exports.up = function (db, cb) {
    db.runSql(
        `
        CREATE TABLE IF NOT EXISTS dependent_features
            (
                parent     varchar(255) NOT NULL,
                child      varchar(255) NOT NULL,
                enabled    boolean DEFAULT true NOT NULL,
                variants   JSONB DEFAULT '[]'::jsonb NOT NULL,
                PRIMARY KEY (parent, child, variants),
                FOREIGN KEY (parent) REFERENCES features (name) ON DELETE CASCADE,
                FOREIGN KEY (child) REFERENCES features (name) ON DELETE CASCADE
            );
        `,
        cb(),
    );
};

exports.down = function (db, cb) {
    db.runSql(
        `
        DROP TABLE dependent_features;
        `,
        cb,
    );
};
