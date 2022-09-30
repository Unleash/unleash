'use strict';

exports.up = function (db, callback) {
    db.runSql(
        `
            create table IF NOT EXISTS public_signup_tokens
            (
                secret text primary key,
                name text,
                expires_at timestamp with time zone not null,
                created_at timestamp with time zone not null default now(),
                created_by text,
                role_id integer not null references roles (id) ON DELETE CASCADE
            );

            create table IF NOT EXISTS public_signup_tokens_user
            (
                secret text not null references public_signup_tokens (secret) on DELETE CASCADE,
                user_id integer not null references users (id) ON DELETE CASCADE,
                created_at timestamp with time zone not null default now(),
                primary key (secret, user_id)
            );
       `,
        callback,
    );
};

exports.down = function (db, callback) {
    db.runSql(
        `
DROP TABLE IF EXISTS public_signup_tokens_user;
DROP TABLE IF EXISTS public_signup_tokens;
        `,
        callback,
    );
};
