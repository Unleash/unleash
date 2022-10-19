'use strict';

exports.up = function (db, cb) {
    db.runSql(
        `
            alter table personal_access_tokens
                drop constraint personal_access_tokens_pkey;
            ALTER TABLE personal_access_tokens
                add column id serial primary key;
        `,
        cb,
    );
};

exports.down = function (db, cb) {
    db.runSql(
        `
            alter table personal_access_tokens
                drop constraint personal_access_tokens_pkey;
            alter table personal_access_tokens
                drop column id;
            alter table personal_access_tokens
                add primary key (secret);

        `,
        cb,
    );
};
