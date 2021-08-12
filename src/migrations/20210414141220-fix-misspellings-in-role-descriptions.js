exports.up = function (db, cb) {
    db.runSql(
        `
        UPDATE roles SET description = 'As an Editor you have access to most features in Unleash, but you can not manage users and roles in the global scope. If you create a project, you will become a project owner and receive superuser rights within the context of that project.' WHERE name = 'Regular';
    `,
        cb,
    );
};

exports.down = function (db, cb) {
    db.runSql('', cb);
};
