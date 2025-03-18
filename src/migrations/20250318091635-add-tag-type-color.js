exports.up = function (db, cb) {
    db.runSql(
        `
        ALTER TABLE tag_types
        ADD COLUMN IF NOT EXISTS color VARCHAR(10);
        
        -- Backfill existing tag types with the default color #FFFFFF
        UPDATE tag_types
        SET color = '#FFFFFF'
        WHERE color IS NULL;
        `,
        cb,
    );
};

exports.down = function (db, cb) {
    db.runSql(
        `
        ALTER TABLE tag_types
        DROP COLUMN IF EXISTS color;
        `,
        cb,
    );
};