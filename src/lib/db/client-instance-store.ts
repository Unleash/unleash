import EventEmitter from 'events';
import { Knex } from 'knex';
import { Logger, LogProvider } from '../logger';
import {
    IClientInstance,
    IClientInstanceStore,
    INewClientInstance,
} from '../types/stores/client-instance-store';
import { hoursToMilliseconds } from 'date-fns';
import Timeout = NodeJS.Timeout;

const metricsHelper = require('../util/metrics-helper');
const { DB_TIME } = require('../metric-events');

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

const mapRow = (row) => ({
    appName: row.app_name,
    instanceId: row.instance_id,
    sdkVersion: row.sdk_version,
    clientIp: row.client_ip,
    lastSeen: row.last_seen,
    createdAt: row.created_at,
    environment: row.environment,
});

const mapToDb = (client) => ({
    app_name: client.appName,
    instance_id: client.instanceId,
    sdk_version: client.sdkVersion || '',
    client_ip: client.clientIp,
    last_seen: client.lastSeen || 'now()',
    environment: client.environment || 'default',
});

export default class ClientInstanceStore implements IClientInstanceStore {
    private db: Knex;

    private logger: Logger;

    private eventBus: EventEmitter;

    private metricTimer: Function;

    private timer: Timeout;

    constructor(db: Knex, eventBus: EventEmitter, getLogger: LogProvider) {
        this.db = db;
        this.eventBus = eventBus;
        this.logger = getLogger('client-instance-store.ts');
        this.metricTimer = (action) =>
            metricsHelper.wrapTimer(eventBus, DB_TIME, {
                store: 'instance',
                action,
            });
        const clearer = () => this._removeInstancesOlderThanTwoDays();
        setTimeout(clearer, 10).unref();
        this.timer = setInterval(clearer, hoursToMilliseconds(24)).unref();
    }

    async _removeInstancesOlderThanTwoDays(): Promise<void> {
        const rows = await this.db(TABLE)
            .whereRaw("created_at < now() - interval '2 days'")
            .del();

        if (rows > 0) {
            this.logger.debug(`Deleted ${rows} instances`);
        }
    }

    async setLastSeen({
        appName,
        instanceId,
        environment,
        clientIp,
    }: INewClientInstance): Promise<void> {
        await this.db(TABLE)
            .update({ last_seen: new Date(), client_ip: clientIp })
            .where({ app_name: appName, instance_id: instanceId, environment })
            .onConflict(['app_name', 'instance_id', 'environment'])
            .ignore();
    }

    async bulkUpsert(instances: INewClientInstance[]): Promise<void> {
        const rows = instances.map(mapToDb);
        await this.db(TABLE)
            .insert(rows)
            .onConflict(['app_name', 'instance_id', 'environment'])
            .merge();
    }

    async delete({
        appName,
        instanceId,
    }: Pick<INewClientInstance, 'appName' | 'instanceId'>): Promise<void> {
        await this.db(TABLE)
            .where({ app_name: appName, instance_id: instanceId })
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
            .where({ app_name: appName, instance_id: instanceId })
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

    async insert(details: INewClientInstance): Promise<void> {
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

    async getDistinctApplications(): Promise<string[]> {
        const rows = await this.db
            .distinct('app_name')
            .select(['app_name'])
            .from(TABLE)
            .orderBy('app_name', 'desc');

        return rows.map((r) => r.app_name);
    }

    async deleteForApplication(appName: string): Promise<void> {
        return this.db(TABLE).where('app_name', appName).del();
    }

    destroy(): void {
        clearInterval(this.timer);
    }
}
