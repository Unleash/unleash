'use strict';

export async function up(db, cb) {
    db.runSql(
        `
        ALTER TABLE client_applications ALTER COLUMN created_at SET DEFAULT now();
        ALTER TABLE client_applications ALTER COLUMN updated_at SET DEFAULT now();
        ALTER TABLE context_fields ALTER COLUMN created_at SET DEFAULT now();
        ALTER TABLE context_fields ALTER COLUMN updated_at SET DEFAULT now();
        ALTER TABLE projects ALTER COLUMN created_at SET DEFAULT now();
        ALTER TABLE users ALTER COLUMN created_at SET DEFAULT now();
    `,
        cb,
    );
};

export async function down(db, cb) {
    db.runSql(
        `
        ALTER TABLE client_applications ALTER COLUMN created_at SET DEFAULT 'now()';
        ALTER TABLE client_applications ALTER COLUMN updated_at SET DEFAULT 'now()';
        ALTER TABLE context_fields ALTER COLUMN created_at SET DEFAULT 'now()';
        ALTER TABLE context_fields ALTER COLUMN updated_at SET DEFAULT 'now()';
        ALTER TABLE projects ALTER COLUMN created_at SET DEFAULT 'now()';
        ALTER TABLE users ALTER COLUMN created_at SET DEFAULT 'now()';

    `,
        cb,
    );
};
