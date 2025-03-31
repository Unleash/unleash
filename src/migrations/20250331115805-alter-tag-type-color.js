exports.up = function (db, cb) {
    db.runSql(
        `
        ALTER TABLE tag_types
        ALTER COLUMN color TYPE VARCHAR(50);
        
        UPDATE tag_types
        SET color = 'common.white';
        `,
        cb,
    );
};

exports.down = function (db, cb) {
    db.runSql(
        `
        ALTER TABLE tag_types
        ALTER COLUMN color TYPE VARCHAR(10);
        `,
        cb,
    );
};