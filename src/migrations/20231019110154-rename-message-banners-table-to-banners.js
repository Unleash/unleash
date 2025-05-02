'use strict';

export async function up(db, cb) {
    db.runSql(`ALTER TABLE message_banners RENAME TO banners`, cb);
};

export async function down(db, cb) {
    db.runSql(`ALTER TABLE banners RENAME TO message_banners`, cb);
};
