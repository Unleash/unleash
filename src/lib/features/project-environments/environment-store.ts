import type EventEmitter from 'events';
import type { Db } from '../../db/db.js';
import type { Logger } from '../../logger.js';
import metricsHelper from '../../util/metrics-helper.js';
import { DB_TIME } from '../../metric-events.js';
import type {
    IEnvironment,
    IEnvironmentCreate,
    IProjectEnvironment,
} from '../../types/model.js';
import NotFoundError from '../../error/notfound-error.js';
import type { IEnvironmentStore } from './environment-store-type.js';
import { snakeCaseKeys } from '../../util/snakeCase.js';
import type { CreateFeatureStrategySchema } from '../../openapi/index.js';
import type { IFlagResolver, IUnleashConfig } from '../../types/index.js';

interface IEnvironmentsTable {
    name: string;
    created_at?: Date;
    type: string;
    sort_order: number;
    enabled: boolean;
    protected: boolean;
    required_approvals?: number | null;
}

interface IEnvironmentsWithCountsTable extends IEnvironmentsTable {
    project_count?: string;
    api_token_count?: string;
    enabled_toggle_count?: string;
}

interface IEnvironmentsWithProjectCountsTable extends IEnvironmentsTable {
    project_api_token_count?: string;
    project_enabled_toggle_count?: string;
    project_default_strategy?: CreateFeatureStrategySchema;
}

const COLUMNS = [
    'type',
    'name',
    'created_at',
    'sort_order',
    'enabled',
    'protected',
    'required_approvals',
];

function mapRow(row: IEnvironmentsTable): IEnvironment {
    return {
        name: row.name,
        type: row.type,
        sortOrder: row.sort_order,
        enabled: row.enabled,
        protected: row.protected,
        requiredApprovals: row.required_approvals,
    };
}

function mapRowWithCounts(
    row: IEnvironmentsWithCountsTable,
): IProjectEnvironment {
    return {
        ...mapRow(row),
        projectCount: row.project_count
            ? Number.parseInt(row.project_count, 10)
            : 0,
        apiTokenCount: row.api_token_count
            ? Number.parseInt(row.api_token_count, 10)
            : 0,
        enabledToggleCount: row.enabled_toggle_count
            ? Number.parseInt(row.enabled_toggle_count, 10)
            : 0,
    };
}

function mapRowWithProjectCounts(
    row: IEnvironmentsWithProjectCountsTable,
): IProjectEnvironment {
    return {
        ...mapRow(row),
        projectApiTokenCount: row.project_api_token_count
            ? Number.parseInt(row.project_api_token_count, 10)
            : 0,
        projectEnabledToggleCount: row.project_enabled_toggle_count
            ? Number.parseInt(row.project_enabled_toggle_count, 10)
            : 0,
        defaultStrategy: row.project_default_strategy
            ? (row.project_default_strategy as any)
            : undefined,
    };
}

function fieldToRow(env: IEnvironment): IEnvironmentsTable {
    return {
        name: env.name,
        type: env.type,
        sort_order: env.sortOrder,
        enabled: env.enabled,
        protected: env.protected,
        required_approvals: env.requiredApprovals,
    };
}

const TABLE = 'environments';

export default class EnvironmentStore implements IEnvironmentStore {
    private logger: Logger;

    private flagResolver: IFlagResolver;

    private db: Db;

    private isOss: boolean;

    private timer: (string) => any;

    constructor(
        db: Db,
        eventBus: EventEmitter,
        {
            getLogger,
            isOss,
            flagResolver,
        }: Pick<IUnleashConfig, 'getLogger' | 'isOss' | 'flagResolver'>,
    ) {
        this.db = db;
        this.logger = getLogger('db/environment-store.ts');
        this.isOss = isOss;
        this.flagResolver = flagResolver;
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

    getMaxSortOrder(): Promise<number> {
        return this.db
            .from(TABLE)
            .max('sort_order')
            .then((res) => Number(res[0].max));
    }

    async get(key: string): Promise<IEnvironment> {
        const stopTimer = this.timer('get');
        let keyQuery = this.db<IEnvironmentsTable>(TABLE).where({ name: key });
        if (this.isOss) {
            keyQuery = keyQuery.whereIn('name', [
                'default',
                'development',
                'production',
            ]);
        }
        const row = await keyQuery.first();
        stopTimer();
        if (row) {
            return mapRow(row);
        }
        throw new NotFoundError(`Could not find environment with name: ${key}`);
    }

    async getAll(query?: Object): Promise<IEnvironment[]> {
        const stopTimer = this.timer('getAll');
        let qB = this.db<IEnvironmentsTable>(TABLE)
            .select('*')
            .orderBy([
                { column: 'sort_order', order: 'asc' },
                { column: 'created_at', order: 'asc' },
            ]);
        if (query) {
            qB = qB.where(query);
        }
        if (this.isOss) {
            qB = qB.whereIn('name', ['default', 'development', 'production']);
        }
        const rows = await qB;
        stopTimer();
        return rows.map(mapRow);
    }

    async getAllWithCounts(query?: Object): Promise<IEnvironment[]> {
        const stopTimer = this.timer('getAllWithCounts');
        let qB = this.db<IEnvironmentsWithCountsTable>(TABLE)
            .select(
                '*',
                this.db.raw(
                    '(SELECT COUNT(*) FROM project_environments WHERE project_environments.environment_name = environments.name) as project_count',
                ),
                this.db.raw(
                    '(SELECT COUNT(*) FROM api_tokens WHERE api_tokens.environment = environments.name) as api_token_count',
                ),
                this.db.raw(
                    '(SELECT COUNT(*) FROM feature_environments WHERE enabled=true AND feature_environments.environment = environments.name) as enabled_toggle_count',
                ),
            )
            .orderBy([
                { column: 'sort_order', order: 'asc' },
                { column: 'created_at', order: 'asc' },
            ]);
        if (query) {
            qB = qB.where(query);
        }
        if (this.isOss) {
            qB = qB.whereIn('name', ['default', 'development', 'production']);
        }
        const rows = await qB;
        stopTimer();
        return rows.map(mapRowWithCounts);
    }

    async getChangeRequestEnvironments(
        environments: string[],
    ): Promise<{ name: string; requiredApprovals: number }[]> {
        const stopTimer = this.timer('getChangeRequestEnvironments');
        const rows = await this.db<IEnvironmentsTable>(TABLE)
            .select('name', 'required_approvals')
            .whereIn('name', environments)
            .andWhere('required_approvals', '>', 0);
        stopTimer();
        return rows.map((row) => ({
            name: row.name,
            requiredApprovals: row.required_approvals || 1,
        }));
    }

    async getProjectEnvironments(
        projectId: string,
        query?: Object,
    ): Promise<IProjectEnvironment[]> {
        const stopTimer = this.timer('getProjectEnvironments');
        let qB = this.db<IEnvironmentsWithProjectCountsTable>(TABLE)
            .select(
                '*',
                this.db.raw(
                    '(SELECT COUNT(*) FROM api_tokens LEFT JOIN api_token_project ON api_tokens.secret = api_token_project.secret WHERE api_tokens.environment = environments.name AND (project = :projectId OR project IS null)) as project_api_token_count',
                    { projectId },
                ),
                this.db.raw(
                    '(SELECT COUNT(*) FROM feature_environments INNER JOIN features on feature_environments.feature_name = features.name WHERE enabled=true AND feature_environments.environment = environments.name AND project = :projectId) as project_enabled_toggle_count',
                    { projectId },
                ),
                this.db.raw(
                    '(SELECT default_strategy FROM project_environments pe WHERE pe.environment_name = environments.name AND pe.project_id = :projectId) as project_default_strategy',
                    { projectId },
                ),
            )
            .orderBy([
                { column: 'sort_order', order: 'asc' },
                { column: 'created_at', order: 'asc' },
            ]);

        if (query) {
            qB = qB.where(query);
        }
        if (this.isOss) {
            qB = qB.whereIn('environments.name', [
                'default',
                'production',
                'development',
            ]);
        }

        const rows = await qB;
        stopTimer();

        return rows.map(mapRowWithProjectCounts);
    }

    async exists(name: string): Promise<boolean> {
        const stopTimer = this.timer('exists');
        const result = await this.db.raw(
            `SELECT EXISTS (SELECT 1 FROM ${TABLE} WHERE name = ?) AS present`,
            [name],
        );
        stopTimer();
        const { present } = result.rows[0];
        return present;
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

    async toggle(name: string, enabled: boolean): Promise<void> {
        await this.db(TABLE)
            .update({
                enabled,
            })
            .where({ name });
    }

    async update(
        env: Pick<IEnvironment, 'type' | 'protected' | 'requiredApprovals'>,
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
