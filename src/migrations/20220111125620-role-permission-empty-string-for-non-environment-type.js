exports.up = function (db, cb) {
    db.runSql(
        `
  UPDATE role_permission SET environment = '' where permission_id NOT IN 
    (select id from permissions WHERE type = 'environment');
`,
        cb,
    );
};

exports.down = function (db, cb) {
    cb();
};
