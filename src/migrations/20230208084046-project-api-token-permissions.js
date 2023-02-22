exports.up = function (db, cb) {
    db.runSql(
        `
        INSERT INTO permissions (permission, display_name, type) VALUES ('READ_PROJECT_API_TOKEN', 'Read api tokens for a specific project', 'project');
        INSERT INTO permissions (permission, display_name, type) VALUES ('CREATE_PROJECT_API_TOKEN', 'Create api tokens for a specific project', 'project');
        INSERT INTO permissions (permission, display_name, type) VALUES ('DELETE_PROJECT_API_TOKEN', 'Delete api tokens for a specific project', 'project');
        `,
        cb,
    );
};

exports.down = function (db, cb) {
    db.runSql(
        `
        DELETE FROM permissions WHERE permission = 'READ_PROJECT_API_TOKEN';
        DELETE FROM permissions WHERE permission = 'CREATE_PROJECT_API_TOKEN';
        DELETE FROM permissions WHERE permission = 'DELETE_PROJECT_API_TOKEN';
  `,
        cb,
    );
};
