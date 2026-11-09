'use strict';

exports.up = function (db, cb) {
    db.runSql(
        `CREATE TABLE api_tokens_v2 (
            selector TEXT PRIMARY KEY,
            verifier TEXT NOT NULL,
            token_name TEXT NOT NULL,
            type TEXT NOT NULL,
            environment TEXT NOT NULL REFERENCES environments(name) ON DELETE CASCADE,
            expires_at TIMESTAMP WITH TIME ZONE,
            created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT (now() AT TIME ZONE 'utc'),
            seen_at TIMESTAMP WITH TIME ZONE
        );
        CREATE TABLE api_tokens_v2_project (
            selector TEXT NOT NULL REFERENCES api_tokens_v2(selector) ON DELETE CASCADE,
            project TEXT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
            PRIMARY KEY (selector, project)
        );`,
        cb,
    );
};

exports.down = function (db, cb) {
    db.runSql(`
    DROP TABLE api_tokens_v2_project;
    DROP TABLE api_tokens_v2;`
        , cb);
};
