'use strict';

exports.up = function (db, cb) {
    db.runSql(
        `
        CREATE TABLE IF NOT EXISTS api_token_project
        (
            secret     text NOT NULL,
            project    text NOT NULL,
            FOREIGN KEY (secret) REFERENCES api_tokens (secret) ON DELETE CASCADE,
            FOREIGN KEY (project) REFERENCES projects(id) ON DELETE CASCADE
        );

        INSERT INTO api_token_project SELECT secret, project FROM api_tokens WHERE project IS NOT NULL;

        ALTER TABLE api_tokens DROP COLUMN "project";
      `,
        cb,
    );
};

//This is a lossy down migration, tokens with multiple projects are discarded
exports.down = function (db, cb) {
    db.runSql(
        `
        ALTER TABLE api_tokens ADD COLUMN project VARCHAR REFERENCES PROJECTS(id) ON DELETE CASCADE;
        DELETE FROM api_tokens WHERE secret LIKE '[]%';

        UPDATE api_tokens
        SET project = subquery.project
        FROM(
            SELECT token.secret, link.project FROM api_tokens AS token LEFT JOIN api_token_project AS link ON
                token.secret  = link.secret
        ) AS subquery
        WHERE api_tokens.project = subquery.project;

        DROP TABLE api_token_project;
`,
        cb,
    );
};
