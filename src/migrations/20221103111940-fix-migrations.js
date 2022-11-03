'use strict';

exports.up = function (db, callback) {
    db.runSql(
        `
        delete from migrations where name in ('/20221901130645-add-change-requests-table', '/20221810114644-add-suggest-changes-table');
        `,
        callback,
    );
};

exports.down = function (db, callback) {
    db.runSql(``, callback);
};
