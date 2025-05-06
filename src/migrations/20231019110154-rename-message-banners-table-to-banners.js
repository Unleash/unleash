'use strict';

exports.up = function (db, cb) {
    db.runSql(`ALTER TABLE message_banners RENAME TO banners`, cb);
};

exports.down = function (db, cb) {
    db.runSql(`ALTER TABLE banners RENAME TO message_banners`, cb);
};
