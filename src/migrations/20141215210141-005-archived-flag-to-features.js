'use strict';

export async function up(db, callback) {
    db.runSql('ALTER TABLE features ADD archived integer DEFAULT 0;', callback);
};

export async function down(db, callback) {
    db.runSql('ALTER TABLE features DROP COLUMN "archived";', callback);
};
