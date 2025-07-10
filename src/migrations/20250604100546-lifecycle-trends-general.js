'use strict';

exports.up = function(db, cb) {
    db.runSql(
        `
            -- 1. Drop old CHECK constraint on 'stage' and add new one
            ALTER TABLE lifecycle_trends
                DROP CONSTRAINT IF EXISTS lifecycle_trends_stage_check,
                ADD CONSTRAINT lifecycle_trends_stage_check
                    CHECK (stage IN ('initial', 'pre-live', 'live', 'completed', 'archived'));

            -- 2. Drop old CHECK constraint on 'flag_type'
            ALTER TABLE lifecycle_trends
                DROP CONSTRAINT IF EXISTS lifecycle_trends_flag_type_check;

            -- 3. Add foreign key to 'flag_type' referencing 'feature_types(id)'
            ALTER TABLE lifecycle_trends
                ADD CONSTRAINT lifecycle_trends_flag_type_fkey
                    FOREIGN KEY (flag_type)
                    REFERENCES feature_types(id)
                    ON DELETE CASCADE;
        `,
        cb,
    );
};

exports.down = function(db, cb) {
    db.runSql(`
            -- 1. Drop foreign key constraint on 'flag_type'
            ALTER TABLE lifecycle_trends
                DROP CONSTRAINT IF EXISTS lifecycle_trends_flag_type_fkey;

            -- 2. Restore original CHECK constraint on 'flag_type'
            ALTER TABLE lifecycle_trends
                ADD CONSTRAINT lifecycle_trends_flag_type_check
                    CHECK (flag_type IN ('experimental', 'release', 'permanent'));

            -- 3. Restore original CHECK constraint on 'stage'
            ALTER TABLE lifecycle_trends
                DROP CONSTRAINT IF EXISTS lifecycle_trends_stage_check,
                ADD CONSTRAINT lifecycle_trends_stage_check
                    CHECK (stage IN ('initial','develop', 'production', 'cleanup', 'archived'));
    `, cb);
};
