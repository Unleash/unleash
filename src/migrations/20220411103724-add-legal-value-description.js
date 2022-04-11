'use strict';

exports.up = function (db, cb) {
    db.runSql(
        `
        -- 1. Convert '1,2,3'::text to "1,2,3"::json
        alter table context_fields
        alter column legal_values set data type json using to_json(legal_values);

        -- 2. Convert "1,2,3"::json to [{"value":"1"}, ...]::json.
        with sub as (
            select a.name, b.json as legal_values
            from context_fields as a
             left join (
                select name, json_agg(json_build_object('value', value)) as json
                from context_fields
                cross join unnest(string_to_array(legal_values #>> '{}', ',')) as value
                group by name
            ) as b on a.name = b.name
        )
        update context_fields set legal_values = sub.legal_values
        from sub
        where context_fields.name = sub.name;
        `,
        cb,
    );
};

exports.down = function (db, cb) {
    db.runSql(
        `
        -- 1. Revert []::json to null.
        update context_fields set legal_values = null
        where legal_values::jsonb = '[]'::jsonb;

        -- 2. Revert [{"value":"1"}, ...]::json to "1,2,3"::json.
        with sub as (
            select name, string_agg(json->>'value', ',') as legal_values
            from context_fields
            cross join json_array_elements(legal_values) as json
            group by name
        )
        update context_fields set legal_values = to_json(sub.legal_values)
        from sub
        where context_fields.name = sub.name;

        -- 3. Revert "1,2,3"::json to '"1,2,3"'::text
        alter table context_fields
        alter column legal_values set data type text;

        -- 4. Revert '"1,2,3"'::text to '1,2,3'::text
        update context_fields set legal_values = legal_values::json #>> '{}';
        `,
        cb,
    );
};
