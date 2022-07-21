import { Knex } from 'knex';
import EventEmitter from 'events';
import { Logger, LogProvider } from '../logger';
import { IAddon, IAddonDto, IAddonStore } from '../types/stores/addon-store';

import metricsHelper from '../util/metrics-helper';
import { DB_TIME } from '../metric-events';
import NotFoundError from '../error/notfound-error';

const COLUMNS = [
    'id',
    'provider',
    'enabled',
    'description',
    'parameters',
    'events',
    'projects',
    'environments',
];
const TABLE = 'addons';

export default class AddonStore implements IAddonStore {
    private db: Knex;

    private logger: Logger;

    private readonly timer: Function;

    constructor(db: Knex, eventBus: EventEmitter, getLogger: LogProvider) {
        this.db = db;
        this.logger = getLogger('addons-store.ts');
        this.timer = (action) =>
            metricsHelper.wrapTimer(eventBus, DB_TIME, {
                store: 'addons',
                action,
            });
    }

    destroy(): void {}

    async getAll(query = {}): Promise<IAddon[]> {
        const stopTimer = this.timer('getAll');
        const rows = await this.db.select(COLUMNS).where(query).from(TABLE);
        stopTimer();
        return rows.map(this.rowToAddon);
    }

    async get(id: number): Promise<IAddon> {
        const stopTimer = this.timer('get');
        return this.db
            .first(COLUMNS)
            .from(TABLE)
            .where({ id })
            .then((row) => {
                stopTimer();
                if (!row) {
                    throw new NotFoundError('Could not find addon');
                } else {
                    return this.rowToAddon(row);
                }
            });
    }

    async insert(addon: IAddonDto): Promise<IAddon> {
        const stopTimer = this.timer('insert');
        // eslint-disable-next-line @typescript-eslint/naming-convention
        const rows = await this.db(TABLE).insert(this.addonToRow(addon), [
            'id',
            'created_at',
        ]);
        stopTimer();
        // eslint-disable-next-line @typescript-eslint/naming-convention
        const { id, created_at } = rows[0];
        return { id, createdAt: created_at, ...addon };
    }

    async update(id: number, addon: IAddonDto): Promise<IAddon> {
        const rows = await this.db(TABLE)
            .where({ id })
            .update(this.addonToRow(addon));

        if (!rows) {
            throw new NotFoundError('Could not find addon');
        }
        return rows[0];
    }

    async delete(id: number): Promise<void> {
        const rows = await this.db(TABLE).where({ id }).del();

        if (!rows) {
            throw new NotFoundError('Could not find addon');
        }
    }

    async deleteAll(): Promise<void> {
        await this.db(TABLE).del();
    }

    async exists(id: number): Promise<boolean> {
        const stopTimer = this.timer('exists');
        const result = await this.db.raw(
            `SELECT EXISTS (SELECT 1 FROM ${TABLE} WHERE id = ?) AS present`,
            [id],
        );
        const { present } = result.rows[0];
        stopTimer();
        return present;
    }

    // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
    rowToAddon(row): IAddon {
        return {
            id: row.id,
            provider: row.provider,
            enabled: row.enabled,
            description: row.description,
            parameters: row.parameters,
            events: row.events,
            projects: row.projects || [],
            environments: row.environments || [],
            createdAt: row.created_at,
        };
    }

    // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
    addonToRow(addon: IAddonDto) {
        return {
            provider: addon.provider,
            enabled: addon.enabled,
            description: addon.description,
            parameters: JSON.stringify(addon.parameters),
            events: JSON.stringify(addon.events),
            projects: JSON.stringify(addon.projects || []),
            environments: JSON.stringify(addon.environments || []),
        };
    }
}
