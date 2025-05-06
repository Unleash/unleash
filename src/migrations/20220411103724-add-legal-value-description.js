'use strict';

exports.up = function (db, cb) {
    db.runSql(
        `
        -- 1. Convert '1,2,3'::text to "1,2,3"::json
        ALTER TABLE context_fields
        ALTER COLUMN legal_values SET DATA TYPE json USING to_json(legal_values);

        -- 2. Convert "1,2,3"::json to [{"value":"1"}, ...]::json.
        WITH sub AS (
            SELECT a.name, b.json AS legal_values
            FROM context_fields AS a
            LEFT JOIN (
                SELECT name, json_agg(json_build_object('value', value)) AS json
                FROM context_fields
                CROSS JOIN unnest(string_to_array(legal_values #>> '{}', ',')) AS value
                GROUP BY name
            ) AS b ON a.name = b.name
        )
        UPDATE context_fields SET legal_values = sub.legal_values
        FROM sub
        WHERE context_fields.name = sub.name;
        `,
        cb,
    );
};

exports.down = function (db, cb) {
    db.runSql(
        `
        -- 1. Revert []::json to null.
        UPDATE context_fields SET legal_values = null
        WHERE legal_values::jsonb = '[]'::jsonb;

        -- 2. Revert [{"value":"1"}, ...]::json to "1,2,3"::json.
        WITH sub AS (
            SELECT name, string_agg(json->>'value', ',') AS legal_values
            FROM context_fields
            CROSS JOIN json_array_elements(legal_values) AS json
            GROUP BY name
        )
        UPDATE context_fields SET legal_values = to_json(sub.legal_values)
        FROM sub
        WHERE context_fields.name = sub.name;

        -- 3. Revert "1,2,3"::json to '"1,2,3"'::text
        ALTER TABLE context_fields
        ALTER COLUMN legal_values SET DATA TYPE text;

        -- 4. Revert '"1,2,3"'::text to '1,2,3'::text
        UPDATE context_fields SET legal_values = legal_values::json #>> '{}';
        `,
        cb,
    );
};
