import EventEmitter from 'events';
import { Knex } from 'knex';
import { Logger, LogProvider } from '../logger';
import metricsHelper from '../util/metrics-helper';
import { DB_TIME } from '../metric-events';
import { IEnvironment } from '../types/model';
import NotFoundError from '../error/notfound-error';
import { IEnvironmentStore } from '../types/stores/environment-store';

interface IEnvironmentsTable {
    name: string;
    display_name: string;
    created_at?: Date;
}

function mapRow(row: IEnvironmentsTable): IEnvironment {
    return {
        name: row.name,
        displayName: row.display_name,
    };
}

function mapInput(input: IEnvironment): IEnvironmentsTable {
    return {
        name: input.name,
        display_name: input.displayName,
    };
}

const TABLE = 'environments';

export default class EnvironmentStore implements IEnvironmentStore {
    private logger: Logger;

    private db: Knex;

    private timer: (string) => any;

    constructor(db: Knex, eventBus: EventEmitter, getLogger: LogProvider) {
        this.db = db;
        this.logger = getLogger('db/environment-store.ts');
        this.timer = (action) =>
            metricsHelper.wrapTimer(eventBus, DB_TIME, {
                store: 'environment',
                action,
            });
    }

    async deleteAll(): Promise<void> {
        await this.db(TABLE).del();
    }

    async get(key: string): Promise<IEnvironment> {
        const row = await this.db<IEnvironmentsTable>(TABLE)
            .where({ name: key })
            .first();
        if (row) {
            return mapRow(row);
        }
        throw new NotFoundError(`Could not find environment with name: ${key}`);
    }

    async getAll(): Promise<IEnvironment[]> {
        const rows = await this.db<IEnvironmentsTable>(TABLE).select('*');
        return rows.map(mapRow);
    }

    async exists(name: string): Promise<boolean> {
        const result = await this.db.raw(
            `SELECT EXISTS (SELECT 1 FROM ${TABLE} WHERE name = ?) AS present`,
            [name],
        );
        const { present } = result.rows[0];
        return present;
    }

    async getByName(name: string): Promise<IEnvironment> {
        const row = await this.db<IEnvironmentsTable>(TABLE)
            .where({ name })
            .first();
        if (!row) {
            throw new NotFoundError(
                `Could not find environment with name ${name}`,
            );
        }
        return mapRow(row);
    }

    async upsert(env: IEnvironment): Promise<IEnvironment> {
        await this.db<IEnvironmentsTable>(TABLE)
            .insert(mapInput(env))
            .onConflict('name')
            .merge();
        return env;
    }

    async delete(name: string): Promise<void> {
        await this.db(TABLE).where({ name }).del();
    }

    destroy(): void {}
}
