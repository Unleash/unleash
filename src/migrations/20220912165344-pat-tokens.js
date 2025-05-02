'use strict';

export async function up(db, cb) {
    db.runSql(
        `
        CREATE TABLE personal_access_tokens (
            secret text not null primary key,
            description text,
            user_id integer not null references users (id) ON DELETE CASCADE,
            expires_at  timestamp with time zone NOT NULL,
            seen_at  timestamp with time zone,
            created_at  timestamp with time zone not null DEFAULT now()
        );`,
        cb,
    );
};

export async function down(db, cb) {
    db.runSql(`drop table personal_access_tokens`, cb);
};
