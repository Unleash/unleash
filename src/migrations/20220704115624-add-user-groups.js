'use strict';

exports.up = function (db, callback) {
    db.runSql(
        `
            create table IF NOT EXISTS groups
            (
                id serial primary key,
                name text not null,
                description text,
                created_by text,
                created_at timestamp with time zone not null default now()
            );

            create table IF NOT EXISTS group_user
            (
                group_id integer not null references groups (id) on DELETE CASCADE,
                user_id integer not null references users (id) ON DELETE CASCADE,
                role text check(role in ('Owner', 'Member')),
                created_by text,
                created_at timestamp with time zone not null default now(),
                primary key (group_id, user_id)
            );
            CREATE TABLE IF NOT EXISTS group_role
            (
                group_id integer not null references groups (id) ON DELETE CASCADE,
                role_id integer not null references roles (id) ON DELETE CASCADE,
                created_by text,
                created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
                project text,
                PRIMARY KEY (group_id, role_id, project)
            );
        `,
        callback,
    );
};

exports.down = function (db, callback) {
    db.runSql(
        `
        drop table group_role;
        drop table group_user;
        drop table groups;
        `,
        callback,
    );
};
