import type { EventEmitter } from 'events';
import type { LogProvider, Logger } from '../../logger.js';
import { DB_TIME } from '../../metric-events.js';
import metricsHelper from '../../util/metrics-helper.js';
import NotFoundError from '../../error/notfound-error.js';
import type { ITagType, ITagTypeStore } from './tag-type-store-type.js';
import type { Db } from '../../db/db.js';

const COLUMNS = ['name', 'description', 'icon', 'color'];
const TABLE = 'tag_types';

interface ITagTypeTable {
    name: string;
    description?: string;
    icon?: string;
    color?: string;
}

export default class TagTypeStore implements ITagTypeStore {
    private db: Db;

    private logger: Logger;

    private readonly timer: Function;

    constructor(db: Db, eventBus: EventEmitter, getLogger: LogProvider) {
        this.db = db;
        this.logger = getLogger('tag-type-store.ts');
        this.timer = (action) =>
            metricsHelper.wrapTimer(eventBus, DB_TIME, {
                store: 'tag-type',
                action,
            });
    }

    async getAll(): Promise<ITagType[]> {
        const stopTimer = this.timer('getTagTypes');
        const rows = await this.db.select(COLUMNS).from(TABLE);
        stopTimer();
        return rows.map(this.rowToTagType);
    }

    async get(name: string): Promise<ITagType> {
        const stopTimer = this.timer('getTagTypeByName');
        return this.db
            .first(COLUMNS)
            .from(TABLE)
            .where({ name })
            .then((row) => {
                stopTimer();
                if (!row) {
                    throw new NotFoundError('Could not find tag-type');
                } else {
                    return this.rowToTagType(row);
                }
            });
    }

    async exists(name: string): Promise<boolean> {
        const stopTimer = this.timer('exists');
        const result = await this.db.raw(
            `SELECT EXISTS (SELECT 1 FROM ${TABLE} WHERE name = ?) AS present`,
            [name],
        );
        const { present } = result.rows[0];
        stopTimer();
        return present;
    }

    async createTagType(newTagType: ITagType): Promise<void> {
        const stopTimer = this.timer('createTagType');
        await this.db(TABLE).insert(newTagType);
        stopTimer();
    }

    async delete(name: string): Promise<void> {
        const stopTimer = this.timer('deleteTagType');
        await this.db(TABLE).where({ name }).del();
        stopTimer();
    }

    async deleteAll(): Promise<void> {
        const stopTimer = this.timer('deleteAll');
        await this.db(TABLE).del();
        stopTimer();
    }

    async bulkImport(tagTypes: ITagType[]): Promise<ITagType[]> {
        const rows = await this.db(TABLE)
            .insert(tagTypes)
            .returning(COLUMNS)
            .onConflict('name')
            .ignore();
        if (rows.length > 0) {
            return rows;
        }
        return [];
    }

    async updateTagType({
        name,
        description,
        icon,
        color,
    }: ITagType): Promise<void> {
        const stopTimer = this.timer('updateTagType');
        await this.db(TABLE)
            .where({ name })
            .update({ description, icon, color });
        stopTimer();
    }

    destroy(): void {}

    rowToTagType(row: ITagTypeTable): ITagType {
        return {
            name: row.name,
            description: row.description,
            icon: row.icon,
            color: row.color,
        };
    }
}
