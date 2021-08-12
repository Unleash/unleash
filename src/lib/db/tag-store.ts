import { Knex } from 'knex';
import { EventEmitter } from 'events';
import { DB_TIME } from '../metric-events';
import metricsHelper from '../util/metrics-helper';
import { LogProvider, Logger } from '../logger';
import NotFoundError from '../error/notfound-error';
import { ITag } from '../types/model';
import { ITagStore } from '../types/stores/tag-store';

const COLUMNS = ['type', 'value'];
const TABLE = 'tags';

interface ITagTable {
    type: string;
    value: string;
}

export default class TagStore implements ITagStore {
    private db: Knex;

    private logger: Logger;

    private readonly timer: Function;

    constructor(db: Knex, eventBus: EventEmitter, getLogger: LogProvider) {
        this.db = db;
        this.logger = getLogger('tag-store.ts');
        this.timer = (action) =>
            metricsHelper.wrapTimer(eventBus, DB_TIME, {
                store: 'tag',
                action,
            });
    }

    async getTagsByType(type: string): Promise<ITag[]> {
        const stopTimer = this.timer('getTagByType');
        const rows = await this.db.select(COLUMNS).from(TABLE).where({ type });
        stopTimer();
        return rows.map(this.rowToTag);
    }

    async getAll(): Promise<ITag[]> {
        const stopTimer = this.timer('getAll');
        const rows = await this.db.select(COLUMNS).from(TABLE);
        stopTimer();
        return rows.map(this.rowToTag);
    }

    async getTag(type: string, value: string): Promise<ITag> {
        const stopTimer = this.timer('getTag');
        const tag = await this.db
            .first(COLUMNS)
            .from(TABLE)
            .where({ type, value });
        stopTimer();
        if (!tag) {
            throw new NotFoundError(
                `No tag with type: [${type}] and value [${value}]`,
            );
        }
        return tag;
    }

    async exists(tag: ITag): Promise<boolean> {
        const stopTimer = this.timer('exists');
        const result = await this.db.raw(
            `SELECT EXISTS (SELECT 1 FROM ${TABLE} WHERE type = ? AND value = ?) AS present`,
            [tag.type, tag.value],
        );
        const { present } = result.rows[0];
        stopTimer();
        return present;
    }

    async createTag(tag: ITag): Promise<void> {
        const stopTimer = this.timer('createTag');
        await this.db(TABLE).insert(tag);
        stopTimer();
    }

    async delete(tag: ITag): Promise<void> {
        const stopTimer = this.timer('deleteTag');
        await this.db(TABLE).where(tag).del();
        stopTimer();
    }

    async deleteAll(): Promise<void> {
        const stopTimer = this.timer('deleteAll');
        await this.db(TABLE).del();
        stopTimer();
    }

    async bulkImport(tags: ITag[]): Promise<ITag[]> {
        return this.db(TABLE)
            .insert(tags)
            .returning(COLUMNS)
            .onConflict(['type', 'value'])
            .ignore();
    }

    destroy(): void {}

    async get({ type, value }: ITag): Promise<ITag> {
        const stopTimer = this.timer('getTag');
        const tag = await this.db
            .first(COLUMNS)
            .from(TABLE)
            .where({ type, value });
        stopTimer();
        if (!tag) {
            throw new NotFoundError(
                `No tag with type: [${type}] and value [${value}]`,
            );
        }
        return tag;
    }

    rowToTag(row: ITagTable): ITag {
        return {
            type: row.type,
            value: row.value,
        };
    }
}
module.exports = TagStore;
