'use strict';

exports.up = function(db, cb) {
        db.runSql(
        `SELECT count(*) as count FROM events;`,
        (err, results) => {
            if (Number(results.rows[0].count) === 4) {
                // If there are exactly 4 events, it means this is a new install
                db.runSql(
                        `DELETE FROM environments WHERE name = 'default';`,

                    cb);
            } else {
                // If there are not exactly 4 events, do nothing
                cb();
            }
        },
    );
};

exports.down = function(db, cb) {
    cb();
};
