'use strict';

exports.up = function (db, cb) {
    db.runSql(
        `
        create table if not exists segments
            (
                id serial primary key,
                name text not null,
                description text,
                created_by text,
                created_at timestamp with time zone not null default now(),
                constraints jsonb not null default '[]'::jsonb
            );

        create table if not exists feature_strategy_segment
            (
                feature_strategy_id text not null references feature_strategies (id) on update cascade on delete cascade not null,
                segment_id integer not null references segments (id) on update cascade on delete cascade not null,
                created_at timestamp with time zone not null default now(),
                primary key (feature_strategy_id, segment_id)
            );

        create index if not exists feature_strategy_segment_segment_id_index
            on feature_strategy_segment (segment_id);
        `,
        cb,
    );
};

exports.down = function (db, cb) {
    db.runSql(
        `
        drop index if exists feature_strategy_segment_segment_id_index;
        drop table if exists feature_strategy_segment;
        drop table if exists segments;
        `,
        cb,
    );
};
