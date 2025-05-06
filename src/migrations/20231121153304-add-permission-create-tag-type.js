exports.up = function (db, cb) {
    db.runSql(
        `
        INSERT INTO permissions (permission, display_name, type) VALUES ('CREATE_TAG_TYPE', 'Create tag types', 'root');
        SELECT assign_unleash_permission_to_role('CREATE_TAG_TYPE', 'Editor');
        `,
        cb
    );
};

exports.down = function (db, cb) {
    db.runSql(
        `
        DELETE FROM permissions WHERE permission = 'CREATE_TAG_TYPE';
        `,
        cb
    );
};
