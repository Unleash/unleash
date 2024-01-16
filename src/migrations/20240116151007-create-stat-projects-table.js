exports.up = function(db, cb) {
    db.runSql(`
        CREATE TABLE stat_projects(
                created_at TIMESTAMP NOT NULL,
                projectId INT NOT NULL,
                flags_active_total INT,
                flags_stale INT,
                flags_archived INT,
                PRIMARY KEY (created_at, projectId)
        );
    `, cb);
};

exports.down = function(db, cb) {
    db.runSql(`
        DROP TABLE IF EXISTS stat_projects;
    `, cb);
};
