'use strict';

const COLUMNS = ['app_name', 'created_at', 'updated_at', 'description', 'url', 'color', 'icon'];
const TABLE = 'client_applications';

const mapRow = (row) => ({
    appName: row.app_name,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    description: row.description,
    url: row.url,
    color: row.color,
    icon: row.icon,
});

const remapRow = (input, old = {}) => ({
    app_name: input.appName,
    updated_at: input.updatedAt,
    description: input.description || old.description,
    url: input.url || old.url,
    color: input.color || old.color,
    icon: input.icon || old.icon,
});


class ClientApplicationsDb {
    constructor (db) {
        this.db = db;
    }

    updateRow (details, prev) {
        details.updatedAt = 'now()';
        return this.db(TABLE)
            .where('app_name', details.appName)
            .update(remapRow(details, prev));
    }

    insertNewRow (details) {
        return this.db(TABLE).insert(remapRow(details));
    }

    upsert (data) {
        if (!data) {
            throw new Error('Missing data to add / update');
        }
        return this.db(TABLE)
            .select(COLUMNS)
            .where('app_name', data.appName)
            .then(result => {
                if (result && result[0]) {
                    return this.updateRow(data, result[0]);
                } else {
                    return this.insertNewRow(data);
                }
            });
    }

    getApplicationMetaData (appName) {
        if (appName) {
            return this.db
                .select(COLUMNS)
                .where('app_name', appName)
                .from(TABLE)
                .map(mapRow);
        }
        return this.db
            .select(COLUMNS)
            .from(TABLE)
            .orderBy('created_at', 'asc')
            .map(mapRow);
    }
};

module.exports = ClientApplicationsDb;
