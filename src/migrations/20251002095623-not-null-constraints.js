exports.up = function (db) {
    return db.runSql(`
        UPDATE feature_strategies 
        SET constraints = '[]'::jsonb 
        WHERE constraints IS NULL;
        
        ALTER TABLE feature_strategies 
        ALTER COLUMN constraints SET DEFAULT '[]'::jsonb,
        ALTER COLUMN constraints SET NOT NULL;
    `);
};

exports.down = function (db) {
    return db.runSql(`
        ALTER TABLE feature_strategies 
        ALTER COLUMN constraints DROP DEFAULT,
        ALTER COLUMN constraints DROP NOT NULL;
    `);
};