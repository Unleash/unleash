import EventEmitter from 'events';
import NotFoundError from '../error/notfound-error';
import {
    IClientApplication,
    IClientApplicationsStore,
} from '../types/stores/client-applications-store';
import { Logger, LogProvider } from '../logger';
import { IApplicationQuery } from '../types/query';
import { Db } from './db';
import { IFlagResolver } from '../types';

const COLUMNS = [
    'app_name',
    'created_at',
    'created_by',
    'updated_at',
    'description',
    'strategies',
    'url',
    'color',
    'icon',
];
const TABLE = 'client_applications';

const TABLE_USAGE = 'client_applications_usage';

const mapRow: (any) => IClientApplication = (row) => ({
    appName: row.app_name,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    description: row.description,
    strategies: row.strategies || [],
    createdBy: row.created_by,
    url: row.url,
    color: row.color,
    icon: row.icon,
    lastSeen: row.last_seen,
    announced: row.announced,
    project: row.project,
    environment: row.environment,
});

const reduceRows = (rows: any[]): IClientApplication[] => {
    const appsObj = rows.reduce((acc, row) => {
        // extracting project and environment from usage table
        const { project, environment } = row;
        const existingApp = acc[row.app_name];

        if (existingApp) {
            const existingProject = existingApp.usage.find(
                (usage) => usage.project === project,
            );

            if (existingProject) {
                existingProject.environments.push(environment);
            } else {
                existingApp.usage.push({
                    project: project,
                    environments: [environment],
                });
            }
        } else {
            acc[row.app_name] = {
                ...mapRow(row),
                usage:
                    project && environment
                        ? [{ project, environments: [environment] }]
                        : [],
            };
        }

        return acc;
    }, {});

    return Object.values(appsObj);
};

const remapRow = (input) => {
    const temp = {
        app_name: input.appName,
        updated_at: input.updatedAt || new Date(),
        seen_at: input.lastSeen || new Date(),
        description: input.description,
        created_by: input.createdBy,
        announced: input.announced,
        url: input.url,
        color: input.color,
        icon: input.icon,
        strategies: JSON.stringify(input.strategies),
    };
    Object.keys(temp).forEach((k) => {
        if (temp[k] === undefined) {
            // not using !temp[k] to allow false and null values to get through
            delete temp[k];
        }
    });
    return temp;
};

const remapUsageRow = (input) => {
    return {
        app_name: input.appName,
        project: input.project || '*',
        environment: input.environment || '*',
    };
};

export default class ClientApplicationsStore
    implements IClientApplicationsStore
{
    private db: Db;

    private flagResolver: IFlagResolver;

    private logger: Logger;

    constructor(
        db: Db,
        eventBus: EventEmitter,
        getLogger: LogProvider,
        flagResolver: IFlagResolver,
    ) {
        this.db = db;
        this.flagResolver = flagResolver;
        this.logger = getLogger('client-applications-store.ts');
    }

    async upsert(details: Partial<IClientApplication>): Promise<void> {
        const row = remapRow(details);
        await this.db(TABLE).insert(row).onConflict('app_name').merge();
        const usageRow = remapUsageRow(details);
        await this.db(TABLE_USAGE)
            .insert(usageRow)
            .onConflict(['app_name', 'project', 'environment'])
            .merge();
    }

    async bulkUpsert(apps: Partial<IClientApplication>[]): Promise<void> {
        const rows = apps.map(remapRow);
        const usageRows = apps.map(remapUsageRow);
        await this.db(TABLE).insert(rows).onConflict('app_name').merge();
        await this.db(TABLE_USAGE)
            .insert(usageRows)
            .onConflict(['app_name', 'project', 'environment'])
            .merge();
    }

    async exists(appName: string): Promise<boolean> {
        const result = await this.db.raw(
            `SELECT EXISTS(SELECT 1 FROM ${TABLE} WHERE app_name = ?) AS present`,
            [appName],
        );
        const { present } = result.rows[0];
        return present;
    }

    async getAll(): Promise<IClientApplication[]> {
        const rows = await this.db
            .select(COLUMNS)
            .from(TABLE)
            .orderBy('app_name', 'asc');

        return rows.map(mapRow);
    }

    async getApplication(appName: string): Promise<IClientApplication> {
        const row = await this.db
            .select(COLUMNS)
            .where('app_name', appName)
            .from(TABLE)
            .first();

        if (!row) {
            throw new NotFoundError(`Could not find appName=${appName}`);
        }

        return mapRow(row);
    }

    async deleteApplication(appName: string): Promise<void> {
        return this.db(TABLE).where('app_name', appName).del();
    }

    /**
     * Could also be done in SQL:
     * (not sure if it is faster though)
     *
     * SELECT app_name from (
     *   SELECT app_name, json_array_elements(strategies)::text as strategyName from client_strategies
     *   ) as foo
     * WHERE foo.strategyName = '"other"';
     */
    async getAppsForStrategy(
        query: IApplicationQuery,
    ): Promise<IClientApplication[]> {
        if (this.flagResolver.isEnabled('newApplicationList')) {
            const rows = await this.db
                .select([
                    ...COLUMNS.map((column) => `${TABLE}.${column}`),
                    'project',
                    'environment',
                ])
                .from(TABLE)
                .leftJoin(
                    TABLE_USAGE,
                    `${TABLE_USAGE}.app_name`,
                    `${TABLE}.app_name`,
                );
            const apps = reduceRows(rows);

            if (query.strategyName) {
                return apps.filter((app) =>
                    app.strategies.includes(query.strategyName),
                );
            }
            return apps;
        } else {
            const rows = await this.db.select(COLUMNS).from(TABLE);
            const apps = rows.map(mapRow);

            if (query.strategyName) {
                return apps.filter((app) =>
                    app.strategies.includes(query.strategyName),
                );
            }
            return apps;
        }
    }

    async getUnannounced(): Promise<IClientApplication[]> {
        const rows = await this.db(TABLE)
            .select(COLUMNS)
            .where('announced', false);
        return rows.map(mapRow);
    }

    /** *
     * Updates all rows that have announced = false to announced =true and returns the rows altered
     * @return {[app]} - Apps that hadn't been announced
     */
    async setUnannouncedToAnnounced(): Promise<IClientApplication[]> {
        const rows = await this.db(TABLE)
            .update({ announced: true })
            .where('announced', false)
            .whereNotNull('announced')
            .returning(COLUMNS);
        return rows.map(mapRow);
    }

    async delete(key: string): Promise<void> {
        await this.db(TABLE).where('app_name', key).del();
    }

    async deleteAll(): Promise<void> {
        await this.db(TABLE).del();
    }

    destroy(): void {}

    async get(appName: string): Promise<IClientApplication> {
        const row = await this.db
            .select(COLUMNS)
            .where('app_name', appName)
            .from(TABLE)
            .first();

        if (!row) {
            throw new NotFoundError(`Could not find appName=${appName}`);
        }

        return mapRow(row);
    }
}
