'use strict';

exports.up = function (db, cb) {
    db.runSql(
        `
        create table segments
            (
                id serial primary key,
                name text not null,
                description text,
                created_by text,
                created_at timestamp with time zone not null default now(),
                constraints jsonb not null default '[]'::jsonb
            );

        create table feature_strategy_segment
            (
                feature_strategy_id text not null references feature_strategies (id) on update cascade on delete cascade not null,
                segment_id integer not null references segments (id) on update cascade on delete cascade not null,
                created_at timestamp with time zone not null default now(),
                primary key (feature_strategy_id, segment_id)
            );

        create index feature_strategy_segment_segment_id_index
            on feature_strategy_segment (segment_id);

        insert into permissions (permission, display_name, type) values
            ('CREATE_SEGMENT', 'Create segments', 'root'),
            ('UPDATE_SEGMENT', 'Edit segments', 'root'),
            ('DELETE_SEGMENT', 'Delete segments', 'root');

        insert into role_permission (role_id, permission_id)
            select
                r.id as role_id,
                p.id as permission_id
            from roles r
            cross join permissions p
            where r.name in (
                'Admin',
                'Editor'
            )
            and p.permission in  (
                'CREATE_SEGMENT',
                'UPDATE_SEGMENT',
                'DELETE_SEGMENT'
            );
        `,
        cb,
    );
};

exports.down = function (db, cb) {
    db.runSql(
        `
        delete from role_permission where permission_id in (
            select id from permissions where permission in (
                'DELETE_SEGMENT',
                'UPDATE_SEGMENT',
                'CREATE_SEGMENT'
            )
        );

        delete from permissions where permission = 'DELETE_SEGMENT';
        delete from permissions where permission = 'UPDATE_SEGMENT';
        delete from permissions where permission = 'CREATE_SEGMENT';

        drop index feature_strategy_segment_segment_id_index;
        drop table feature_strategy_segment;
        drop table segments;
        `,
        cb,
    );
};
