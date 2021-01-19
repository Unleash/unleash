'use strict';

const metricsHelper = require('../metrics-helper');
const { DB_TIME } = require('../events');
const NotFoundError = require('../error/notfound-error');

const COLUMNS = [
    'id',
    'provider',
    'enabled',
    'description',
    'parameters',
    'events',
];
const TABLE = 'addons';

class AddonStore {
    constructor(db, eventBus, getLogger) {
        this.db = db;
        this.logger = getLogger('addons-store.js');
        this.timer = action =>
            metricsHelper.wrapTimer(eventBus, DB_TIME, {
                store: 'addons',
                action,
            });
    }

    async getAll(query = {}) {
        const stopTimer = this.timer('getAll');
        const rows = await this.db
            .select(COLUMNS)
            .where(query)
            .from(TABLE);
        stopTimer();
        return rows.map(this.rowToAddon);
    }

    async get(id) {
        const stopTimer = this.timer('get');
        return this.db
            .first(COLUMNS)
            .from(TABLE)
            .where({ id })
            .then(row => {
                stopTimer();
                if (!row) {
                    throw new NotFoundError('Could not find addon');
                } else {
                    return this.rowToAddon(row);
                }
            });
    }

    async insert(addon) {
        const stopTimer = this.timer('insert');
        const [id] = await this.db(TABLE).insert(this.addonToRow(addon), 'id');
        stopTimer();
        return { id, ...addon };
    }

    async update(id, addon) {
        const rows = await this.db(TABLE)
            .where({ id })
            .update(this.addonToRow(addon));

        if (!rows) {
            throw new NotFoundError('Could not find addon');
        }
        return rows;
    }

    async delete(id) {
        const rows = await this.db(TABLE)
            .where({ id })
            .del();

        if (!rows) {
            throw new NotFoundError('Could not find addon');
        }
        return rows;
    }

    rowToAddon(row) {
        return {
            id: row.id,
            provider: row.provider,
            enabled: row.enabled,
            description: row.description,
            parameters: row.parameters,
            events: row.events,
        };
    }

    addonToRow(addon) {
        return {
            provider: addon.provider,
            enabled: addon.enabled,
            description: addon.description,
            parameters: JSON.stringify(addon.parameters),
            events: JSON.stringify(addon.events),
        };
    }
}

module.exports = AddonStore;
