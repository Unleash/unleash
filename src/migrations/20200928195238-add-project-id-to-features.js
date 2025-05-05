
export async function up(db, cb) {
    return db.addColumn(
        'features',
        'project',
        {
            type: 'string',
            defaultValue: 'default',
        },
        cb,
    );
};

export async function down(db, cb) {
    return db.removeColumn('features', 'project', cb);
};
