exports.up = function (db, cb) {
    db.runSql(
        `
        ALTER TABLE action_sets ADD COLUMN enabled BOOLEAN DEFAULT true;
        `,
        cb,
    );
};

exports.down = function (db, cb) {
    db.runSql(
        `
        ALTER TABLE action_sets DROP COLUMN enabled;
        `,
        cb,
    );
};
