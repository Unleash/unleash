exports.up = (db, callback) => {
    db.runSql(
        `
            CREATE TABLE IF NOT EXISTS feature_project (
                                             feature_name VARCHAR(255) NOT NULL,
                                             project_id VARCHAR(255) NOT NULL,
                                             PRIMARY KEY (feature_name, project_id),
                                             FOREIGN KEY (feature_name) REFERENCES features(name) ON DELETE CASCADE,
                                             FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
            );
            INSERT INTO feature_project (feature_name, project_id)
            SELECT name, project
            FROM features
            WHERE project IS NOT NULL;
        `,
        callback,
    );
};

exports.down = (db, callback) => {
    db.runSql(
        `DROP TABLE IF EXISTS feature_project`,
        callback,
    );
};
