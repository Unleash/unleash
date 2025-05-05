
export async function up(db, cb) {
    return db.addColumn(
        'features',
        'stale',
        {
            type: 'boolean',
            defaultValue: false,
        },
        cb,
    );
};

export async function down(db, cb) {
    return db.removeColumn('features', 'stale', cb);
};
