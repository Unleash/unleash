'use strict';

exports.up = function (db, callback) {
    db.runSql(
        `
            CREATE TABLE IF NOT EXISTS favorite_features
            (
                feature VARCHAR(255) NOT NULL REFERENCES features (name) ON DELETE CASCADE,
                user_id INTEGER NOT NULL REFERENCES users (id) ON DELETE CASCADE,
                created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                PRIMARY KEY (feature, user_id)
            );

            CREATE TABLE IF NOT EXISTS favorite_projects
            (
                project VARCHAR(255) NOT NULL REFERENCES projects (id) ON DELETE CASCADE,
                user_id INTEGER NOT NULL REFERENCES users (id) ON DELETE CASCADE,
                created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                PRIMARY KEY (project, user_id)
            );
        `,
        callback,
    );
};

exports.down = function (db, callback) {
    db.runSql(
        `
            DROP TABLE IF EXISTS favorite_features;
            DROP TABLE IF EXISTS favorite_projects;
        `,
        callback,
    );
};
