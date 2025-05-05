exports.up = function (db, cb) {
    db.runSql(
        `
    UPDATE role_user set project = 'default' where role_id 
    IN (SELECT id as role_id from roles WHERE name in ('Admin', 'Editor', 'Viewer') LIMIT 3)
  `,
        cb,
    );
};

exports.down = function (db, cb) {
    db.runSql(
        `
      UPDATE role_user set project = '*' where role_id 
      IN (SELECT id as role_id from roles WHERE name in ('Admin', 'Editor', 'Viewer') LIMIT 3)
`,
        cb,
    );
};
