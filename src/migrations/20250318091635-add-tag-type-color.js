export async function up(db, cb) {
    db.runSql(
        `
        ALTER TABLE tag_types
        ADD COLUMN IF NOT EXISTS color VARCHAR(10);
        
        UPDATE tag_types
        SET color = '#FFFFFF'
        WHERE color IS NULL;
        `,
        cb,
    );
};

export async function down(db, cb) {
    db.runSql(
        `
        ALTER TABLE tag_types
        DROP COLUMN IF EXISTS color;
        `,
        cb,
    );
};