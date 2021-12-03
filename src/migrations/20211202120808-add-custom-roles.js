exports.up = function (db, cb) {
    db.runSql(
        `
            ALTER TABLE roles RENAME TO role_project;
            CREATE TABLE roles (
                id integer PRIMARY KEY NOT NULL,
                name varchar(255),
                description text
            );
    `,
        cb,
    );
};

exports.down = function (db, cb) {
    db.runSql(
        `
        DROP TABLE roles;
        ALTER TABLE role_project RENAME TO roles;
  `,
        cb,
    );
};
