
exports.up = (db, callback) => {
    db.runSql(
        `
        ALTER TABLE roles DROP CONSTRAINT unique_name;
        ALTER TABLE roles ADD CONSTRAINT roles_type_name_unique UNIQUE (type, name);

        INSERT INTO roles (name, description, type)
        VALUES ('Reader', 'Users with the project reader role have read-only access to the project and cannot make changes.', 'project')
        ON CONFLICT (type, name) DO NOTHING;
        `,
        callback,
    );
};

exports.down = (db, callback) => {
    db.runSql(
        `
        DELETE FROM roles WHERE type = 'project' AND name = 'Reader';
        ALTER TABLE roles DROP CONSTRAINT roles_type_name_unique;
        ALTER TABLE roles ADD CONSTRAINT unique_name UNIQUE (name);
        `,
        callback,
    );
};
