exports.up = function (db, cb) {
    db.runSql(
        `
        UPDATE environments 
        SET enabled = false
        WHERE name = 'default'
        AND NOT EXISTS (select  * from features);

        DELETE FROM project_environments 
        WHERE environment_name = 'default'
        AND NOT EXISTS (select  * from features);

        INSERT INTO project_environments(project_id, environment_name) 
        SELECT 'default', 'development'
        WHERE NOT EXISTS (select  * from features);
        
        INSERT INTO project_environments(project_id, environment_name) 
        SELECT 'default', 'production'
        WHERE NOT EXISTS (select  * from features);
      `,
        cb,
    );
};

exports.down = function (db, cb) {
    db.runSql('', cb);
};
