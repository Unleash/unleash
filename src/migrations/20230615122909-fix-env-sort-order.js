'use strict';

exports.up = function (db, callback) {
    db.runSql(
        `
            WITH sorted_environments AS (
                SELECT
                    *,
                    ROW_NUMBER() OVER (
                        ORDER BY
                            sort_order,
                            created_at
                        ) AS new_sort_order
                FROM
                    environments
            )
            UPDATE
                environments
            SET
                sort_order = sorted_environments.new_sort_order
            FROM
                sorted_environments
            WHERE
                environments.name = sorted_environments.name;
        `,
        callback,
    );
};

exports.down = function (db, callback) {
    db.runSql(``, callback);
};
