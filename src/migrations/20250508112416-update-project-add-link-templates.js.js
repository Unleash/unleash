exports.up = (db, callback) => {
    db.runSql(
        `ALTER TABLE project_settings ADD COLUMN link_templates JSONB DEFAULT '[]'`,
        callback,
    );
};

exports.down = (db, callback) => {
    db.runSql(
        `ALTER TABLE project_settings DROP COLUMN link_templates`,
        callback,
    );
};
