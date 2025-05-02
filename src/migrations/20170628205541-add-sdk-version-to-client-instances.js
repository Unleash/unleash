'use strict';

export async function up(db, callback) {
    db.runSql(
        'ALTER TABLE client_instances ADD "sdk_version" varchar(255);',
        callback,
    );
};

export async function down(db, callback) {
    db.runSql(
        'ALTER TABLE client_instances DROP COLUMN "sdk_version";',
        callback,
    );
};
