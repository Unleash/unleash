'use strict';

exports.up = function (db, callback) {
    db.runSql(
        `
            CREATE TABLE IF NOT EXISTS feedback
            (
                id SERIAL PRIMARY KEY NOT NULL,
                category TEXT NOT NULL,
                user_type TEXT,
                difficulty_score INTEGER,
                positive TEXT,
                areas_for_improvement TEXT,
                created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
            );
        `,
        callback,
    );
};

exports.down = function (db, callback) {
    db.runSql(
        `
        DROP TABLE IF EXISTS feedback;
        `,
        callback,
    );
};
