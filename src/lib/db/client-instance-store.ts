import type EventEmitter from 'events';
import type { Logger, LogProvider } from '../logger.js';
import type {
    IClientInstance,
    IClientInstanceStore,
    INewClientInstance,
} from '../types/stores/client-instance-store.js';
import { subDays } from 'date-fns';
import type { Db } from './db.js';
import metricsHelper from '../util/metrics-helper.js';
import { DB_TIME } from '../metric-events.js';

const COLUMNS = [
    'app_name',
    'instance_id',
    'sdk_version',
    'client_ip',
    'last_seen',
    'created_at',
    'environment',
];
const TABLE = 'client_instances';

const mapRow = (row): IClientInstance => ({
    appName: row.app_name,
    instanceId: row.instance_id,
    sdkVersion: row.sdk_version,
    sdkType: row.sdk_type,
    clientIp: row.client_ip,
    lastSeen: row.last_seen,
    createdAt: row.created_at,
    environment: row.environment,
});

const mapToDb = (client: INewClientInstance) => {
    const temp = {
        app_name: client.appName,
        instance_id: client.instanceId,
        sdk_version: client.sdkVersion,
        sdk_type: client.sdkType,
        client_ip: client.clientIp,
        last_seen: client.lastSeen || 'now()',
        environment: client.environment,
    };

    const result = {};
    for (const [key, value] of Object.entries(temp)) {
        if (value !== undefined) {
            result[key] = value;
        }
    }

    return result;
};

export default class ClientInstanceStore implements IClientInstanceStore {
    private db: Db;

    private logger: Logger;

    private eventBus: EventEmitter;

    private metricTimer: Function;

    constructor(db: Db, eventBus: EventEmitter, getLogger: LogProvider) {
        this.db = db;
        this.eventBus = eventBus;
        this.logger = getLogger('client-instance-store.ts');
        this.metricTimer = (action) =>
            metricsHelper.wrapTimer(eventBus, DB_TIME, {
                store: 'instance',
                action,
            });
    }

    async removeOldInstances(): Promise<void> {
        const rows = await this.db(TABLE)
            .whereRaw("last_seen < now() - interval '1 days'")
            .del();

        if (rows > 0) {
            this.logger.debug(`Deleted ${rows} instances`);
        }
    }

    async bulkUpsert(instances: INewClientInstance[]): Promise<void> {
        const stopTimer = this.metricTimer('bulkUpsert');

        const rows = instances.map(mapToDb);
        await this.db(TABLE)
            .insert(rows)
            .onConflict(['app_name', 'instance_id', 'environment'])
            .merge();

        stopTimer();
    }

    async delete({
        appName,
        instanceId,
    }: Pick<INewClientInstance, 'appName' | 'instanceId'>): Promise<void> {
        await this.db(TABLE)
            .where({
                app_name: appName,
                instance_id: instanceId,
            })
            .del();
    }

    async deleteAll(): Promise<void> {
        await this.db(TABLE).del();
    }

    async get({
        appName,
        instanceId,
    }: Pick<
        INewClientInstance,
        'appName' | 'instanceId'
    >): Promise<IClientInstance> {
        const row = await this.db(TABLE)
            .where({
                app_name: appName,
                instance_id: instanceId,
            })
            .first();
        return mapRow(row);
    }

    async exists({
        appName,
        instanceId,
    }: Pick<INewClientInstance, 'appName' | 'instanceId'>): Promise<boolean> {
        const result = await this.db.raw(
            `SELECT EXISTS (SELECT 1 FROM ${TABLE} WHERE app_name = ? AND instance_id = ?) AS present`,
            [appName, instanceId],
        );
        const { present } = result.rows[0];
        return present;
    }

    async upsert(details: INewClientInstance): Promise<void> {
        const stopTimer = this.metricTimer('insert');

        await this.db(TABLE)
            .insert(mapToDb(details))
            .onConflict(['app_name', 'instance_id', 'environment'])
            .merge();

        stopTimer();
    }

    async getAll(): Promise<IClientInstance[]> {
        const stopTimer = this.metricTimer('getAll');

        const rows = await this.db
            .select(COLUMNS)
            .from(TABLE)
            .orderBy('last_seen', 'desc');

        const toggles = rows.map(mapRow);

        stopTimer();

        return toggles;
    }

    async getByAppName(appName: string): Promise<IClientInstance[]> {
        const rows = await this.db
            .select()
            .from(TABLE)
            .where('app_name', appName)
            .orderBy('last_seen', 'desc');

        return rows.map(mapRow);
    }

    async getRecentByAppNameAndEnvironment(
        appName: string,
        environment: string,
    ): Promise<IClientInstance[]> {
        const rows = await this.db
            .select()
            .from(TABLE)
            .where('app_name', appName)
            .where('environment', environment)
            .whereRaw("last_seen >= NOW() - INTERVAL '24 hours'")
            .orderBy('last_seen', 'desc')
            .limit(1000);

        return rows.map(mapRow);
    }

    async getBySdkName(sdkName: string): Promise<IClientInstance[]> {
        const sdkPrefix = `${sdkName}%`;
        const rows = await this.db
            .select()
            .from(TABLE)
            .whereLike('sdk_version', sdkPrefix)
            .orderBy('last_seen', 'desc');
        return rows.map(mapRow);
    }

    async groupApplicationsBySdk(): Promise<
        { sdkVersion: string; applications: string[] }[]
    > {
        const rows = await this.db
            .select([
                'sdk_version as sdkVersion',
                this.db.raw('ARRAY_AGG(DISTINCT app_name) as applications'),
            ])
            .from(TABLE)
            .groupBy('sdk_version');

        return rows;
    }
    async groupApplicationsBySdkAndProject(
        projectId: string,
    ): Promise<{ sdkVersion: string; applications: string[] }[]> {
        const rows = await this.db
            .with(
                'instances',
                this.db
                    .select('app_name', 'sdk_version')
                    .distinct()
                    .from('client_instances'),
            )
            .select([
                'i.sdk_version as sdkVersion',
                this.db.raw('ARRAY_AGG(DISTINCT cme.app_name) as applications'),
            ])
            .from('client_metrics_env as cme')
            .leftJoin('features as f', 'f.name', 'cme.feature_name')
            .leftJoin('instances as i', 'i.app_name', 'cme.app_name')
            .where('f.project', projectId)
            .groupBy('i.sdk_version');

        return rows;
    }

    async getDistinctApplications(): Promise<string[]> {
        const rows = await this.db
            .distinct('app_name')
            .select(['app_name'])
            .from(TABLE)
            .orderBy('app_name', 'desc');

        return rows.map((r) => r.app_name);
    }

    async getDistinctApplicationsCount(daysBefore?: number): Promise<number> {
        const query = this.db
            .from((qb) =>
                qb
                    .select('app_name')
                    .from(TABLE)
                    .modify((qb) => {
                        if (daysBefore) {
                            qb.where(
                                'last_seen',
                                '>',
                                subDays(new Date(), daysBefore),
                            );
                        }
                    })
                    .groupBy('app_name')
                    .as('subquery'),
            )
            .count('* as count');

        return query.then((res) => Number(res[0].count));
    }

    async deleteForApplication(appName: string): Promise<void> {
        return this.db(TABLE).where('app_name', appName).del();
    }

    destroy(): void {}
}
