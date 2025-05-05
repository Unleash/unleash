
import async from 'async';

const settingsId = 'unleash.enterprise.api.keys';

const toApiToken = (legacyToken) => ({
    secret: legacyToken.key,
    username: legacyToken.username,
    createdAt: legacyToken.created || new Date(),
    type: legacyToken.priviliges.some((n) => n === 'ADMIN')
        ? 'admin'
        : 'client',
});

export async function up(db, cb) {
    db.runSql(
        `SELECT * from settings where name = '${settingsId}';`,
        (err, results) => {
            if (results.rowCount === 1) {
                const legacyTokens = results.rows[0].content.keys;
                const inserts = legacyTokens.map(toApiToken).map((t) =>
                    db.runSql.bind(
                        db,
                        `INSERT INTO api_tokens (secret, username, type, created_at) 
                         VALUES (?, ?, ?, ?) 
                         ON CONFLICT DO NOTHING;`,
                        [t.secret, t.username, t.type, t.createdAt],
                    ),
                );
                async.series(inserts, cb);
            } else {
                cb();
            }
        },
    );
};

export async function down(db, cb) {
    cb();
};
