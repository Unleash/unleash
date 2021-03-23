import { Knex } from 'knex';
import { EventEmitter } from 'events';
import { LogProvider, Logger } from '../logger';
import { DB_TIME } from '../events';
import metricsHelper from '../metrics-helper';
import NotFoundError from '../error/notfound-error';

const COLUMNS = ['name', 'description', 'icon'];
const TABLE = 'tag_types';

interface ITagTypeTable {
    name: string;
    description: string;
    icon: string;
}

interface ITagType {
    name: string;
    description: string;
    icon: string;
}

class TagTypeStore {
    private db: Knex;

    private logger: Logger;

    private readonly timer: Function;

    constructor(db: Knex, eventBus: EventEmitter, getLogger: LogProvider) {
        this.db = db;
        this.logger = getLogger('tag-type-store.js');
        this.timer = action =>
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

    async getTagType(name): Promise<ITagType> {
        const stopTimer = this.timer('getTagTypeByName');
        return this.db
            .first(COLUMNS)
            .from(TABLE)
            .where({ name })
            .then(row => {
                stopTimer();
                if (!row) {
                    throw new NotFoundError('Could not find tag-type');
                } else {
                    return this.rowToTagType(row);
                }
            });
    }

    async exists(name): Promise<Boolean> {
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

    async deleteTagType(name: string): Promise<void> {
        const stopTimer = this.timer('deleteTagType');
        await this.db(TABLE)
            .where({ name })
            .del();
        stopTimer();
    }

    async dropTagTypes(): Promise<void> {
        const stopTimer = this.timer('dropTagTypes');
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

    async updateTagType({ name, description, icon }: ITagType): Promise<void> {
        const stopTimer = this.timer('updateTagType');
        await this.db(TABLE)
            .where({ name })
            .update({ description, icon });
        stopTimer();
    }

    rowToTagType(row: ITagTypeTable): ITagType {
        return {
            name: row.name,
            description: row.description,
            icon: row.icon,
        };
    }
}

module.exports = TagTypeStore;
