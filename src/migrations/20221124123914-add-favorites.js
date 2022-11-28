'use strict';

exports.up = function (db, callback) {
    db.runSql(
        `
            CREATE TABLE IF NOT EXISTS favorite_features
            (
                feature varchar(255) not null references features (name) on DELETE CASCADE,
                user_id integer not null references users (id) ON DELETE CASCADE,
                created_at timestamp with time zone not null default now(),
                primary key (feature, user_id)
            );

            CREATE TABLE IF NOT EXISTS favorite_projects
            (
                project varchar(255) not null references projects (id) on DELETE CASCADE,
                user_id integer not null references users (id) ON DELETE CASCADE,
                created_at timestamp with time zone not null default now(),
                primary key (project, user_id)
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
