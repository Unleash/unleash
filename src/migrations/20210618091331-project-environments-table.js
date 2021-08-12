exports.up = function (db, cb) {
    db.runSql(
        `
        CREATE TABLE project_environments (
            project_id varchar(255) REFERENCES projects(id) ON DELETE CASCADE,
            environment_name varchar(100) REFERENCES environments(name) ON DELETE CASCADE,
            PRIMARY KEY(project_id, environment_name)
        );
    `,
        cb,
    );
};

exports.down = function (db, cb) {
    db.runSql('DROP TABLE project_environments', cb);
};

exports._meta = {
    version: 1,
};
