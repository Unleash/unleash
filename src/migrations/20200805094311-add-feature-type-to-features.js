
export async function up(db, cb) {
    return db.addColumn(
        'features',
        'type',
        {
            type: 'string',
            defaultValue: 'release',
        },
        cb,
    );
};

export async function down(db, cb) {
    return db.removeColumn('features', 'type', cb);
};
