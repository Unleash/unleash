exports.up = function (db, cb) {
    db.runSql(
        `
        CREATE TABLE IF NOT EXISTS servicenow_change_references (
            change_request_id INTEGER NOT NULL
                REFERENCES change_requests(id) ON DELETE CASCADE,
            integration_id INTEGER NOT NULL
                REFERENCES addons(id) ON DELETE CASCADE,
            sys_id TEXT,
            created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT (now() at time zone 'utc'),
            PRIMARY KEY (change_request_id, integration_id)
        );
        CREATE UNIQUE INDEX servicenow_change_references_sys_id_idx
            ON servicenow_change_references (sys_id);
        `,
        cb,
    );
};

exports.down = function (db, cb) {
    db.runSql(
        `
        DROP TABLE IF EXISTS servicenow_change_references;
        `,
        cb,
    );
};
