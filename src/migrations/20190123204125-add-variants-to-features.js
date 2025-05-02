'use strict';

export async function up(db, callback) {
    db.runSql(
        `
        ALTER TABLE features ADD "variants" json;
        ALTER TABLE features ALTER COLUMN "variants" SET DEFAULT '[]';
    `,
        callback,
    );
};

export async function down(db, callback) {
    db.runSql('ALTER TABLE features DROP COLUMN "variants";', callback);
};
