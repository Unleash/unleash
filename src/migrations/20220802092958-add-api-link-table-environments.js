'use strict';

exports.up = function (db, cb) {
    db.runSql(
        `
        CREATE TABLE IF NOT EXISTS api_token_environment
        (
            secret     text NOT NULL,
            environment    text NOT NULL,
            FOREIGN KEY (secret) REFERENCES api_tokens (secret) ON DELETE CASCADE,
            FOREIGN KEY (environment) REFERENCES environments(name) ON DELETE CASCADE
        );

        INSERT INTO api_token_environment SELECT secret, environment FROM api_tokens WHERE environment IS NOT NULL;

        ALTER TABLE api_tokens DROP COLUMN "environment";
      `,
        cb,
    );
};

//This is a lossy down migration, tokens with multiple environments are discarded
exports.down = function (db, cb) {
    db.runSql(
        `
        ALTER TABLE api_tokens ADD COLUMN environment VARCHAR REFERENCES ENVIRONMENTS(name) ON DELETE CASCADE;
        DELETE FROM api_tokens WHERE secret LIKE '[]%';

        UPDATE api_tokens
        SET environment = subquery.environment
        FROM(
            SELECT token.secret, link.environment FROM api_tokens AS token LEFT JOIN api_token_environment AS link ON
                token.secret  = link.secret
        ) AS subquery
        WHERE api_tokens.environment = subquery.environment;

        DROP TABLE api_token_environment;
`,
        cb,
    );
};
