import EventEmitter from 'events';
import { Knex } from 'knex';
import { Logger, LogProvider } from '../logger';
import metricsHelper from '../util/metrics-helper';
import { DB_TIME } from '../metric-events';
import { IEnvironment, IEnvironmentCreate } from '../types/model';
import NotFoundError from '../error/notfound-error';
import { IEnvironmentStore } from '../types/stores/environment-store';
import { snakeCaseKeys } from '../util/snakeCase';

interface IEnvironmentsTable {
    name: string;
    created_at?: Date;
    type: string;
    sort_order: number;
    enabled: boolean;
    protected: boolean;
}

const COLUMNS = [
    'type',
    'name',
    'created_at',
    'sort_order',
    'enabled',
    'protected',
];

function mapRow(row: IEnvironmentsTable): IEnvironment {
    return {
        name: row.name,
        type: row.type,
        sortOrder: row.sort_order,
        enabled: row.enabled,
        protected: row.protected,
    };
}

function fieldToRow(env: IEnvironment): IEnvironmentsTable {
    return {
        name: env.name,
        type: env.type,
        sort_order: env.sortOrder,
        enabled: env.enabled,
        protected: env.protected,
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

    async importEnvironments(
        environments: IEnvironment[],
    ): Promise<IEnvironment[]> {
        const rows = await this.db(TABLE)
            .insert(environments.map(fieldToRow))
            .returning(COLUMNS)
            .onConflict('name')
            .ignore();

        return rows.map(mapRow);
    }

    async deleteAll(): Promise<void> {
        await this.db(TABLE).del();
    }

    count(): Promise<number> {
        return this.db
            .from(TABLE)
            .count('*')
            .then((res) => Number(res[0].count));
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

    async getAll(query?: Object): Promise<IEnvironment[]> {
        let qB = this.db<IEnvironmentsTable>(TABLE)
            .select('*')
            .orderBy([
                { column: 'sort_order', order: 'asc' },
                { column: 'created_at', order: 'asc' },
            ]);
        if (query) {
            qB = qB.where(query);
        }
        const rows = await qB;
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

    async updateProperty(
        id: string,
        field: string,
        value: string | number,
    ): Promise<void> {
        await this.db<IEnvironmentsTable>(TABLE)
            .update({
                [field]: value,
            })
            .where({ name: id, protected: false });
    }

    async updateSortOrder(id: string, value: number): Promise<void> {
        await this.db<IEnvironmentsTable>(TABLE)
            .update({
                sort_order: value,
            })
            .where({ name: id });
    }

    async update(
        env: Pick<IEnvironment, 'type' | 'protected'>,
        name: string,
    ): Promise<IEnvironment> {
        const updatedEnv = await this.db<IEnvironmentsTable>(TABLE)
            .update(snakeCaseKeys(env))
            .where({ name, protected: false })
            .returning<IEnvironmentsTable>(COLUMNS);

        return mapRow(updatedEnv[0]);
    }

    async create(env: IEnvironmentCreate): Promise<IEnvironment> {
        const row = await this.db<IEnvironmentsTable>(TABLE)
            .insert(snakeCaseKeys(env))
            .returning<IEnvironmentsTable>(COLUMNS);

        return mapRow(row[0]);
    }

    async disable(environments: IEnvironment[]): Promise<void> {
        await this.db(TABLE)
            .update({
                enabled: false,
            })
            .whereIn(
                'name',
                environments.map((env) => env.name),
            );
    }

    async enable(environments: IEnvironment[]): Promise<void> {
        await this.db(TABLE)
            .update({
                enabled: true,
            })
            .whereIn(
                'name',
                environments.map((env) => env.name),
            );
    }

    async delete(name: string): Promise<void> {
        await this.db(TABLE).where({ name, protected: false }).del();
    }

    destroy(): void {}
}
