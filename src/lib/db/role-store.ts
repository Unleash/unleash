import EventEmitter from 'events';
import { Knex } from 'knex';
import { Logger, LogProvider } from '../logger';
import NotFoundError from '../error/notfound-error';
import { ICustomRole } from 'lib/types/model';
import { ICustomRoleInsert } from 'lib/types/stores/role-store';

const TABLE = 'roles';
const COLUMNS = ['id', 'name', 'description', 'type'];

interface IRoleRow {
    id: number;
    name: string;
    description: string;
    type: string;
}

export default class RoleStore {
    private logger: Logger;

    private eventBus: EventEmitter;

    private db: Knex;

    constructor(db: Knex, eventBus: EventEmitter, getLogger: LogProvider) {
        this.db = db;
        this.eventBus = eventBus;
        this.logger = getLogger('lib/db/role-store.ts');
    }

    async getAll(): Promise<ICustomRole[]> {
        const rows = await this.db
            .select(COLUMNS)
            .from(TABLE)
            .orderBy('name', 'asc');

        return rows.map(this.mapRow);
    }

    async create(role: ICustomRoleInsert): Promise<ICustomRole> {
        const row = await this.db(TABLE)
            .insert({
                name: role.name,
                description: role.description,
                type: role.roleType,
            })
            .returning('*');
        return this.mapRow(row[0]);
    }

    async delete(id: number): Promise<void> {
        return this.db(TABLE).where({ id }).del();
    }

    async get(id: number): Promise<ICustomRole> {
        const rows = await this.db.select(COLUMNS).from(TABLE).where({ id });
        return this.mapRow(rows[0]);
    }

    async exists(id: number): Promise<boolean> {
        const result = await this.db.raw(
            `SELECT EXISTS (SELECT 1 FROM ${TABLE} WHERE id = ?) AS present`,
            [id],
        );
        const { present } = result.rows[0];
        return present;
    }

    async deleteAll(): Promise<void> {
        return this.db(TABLE).del();
    }

    mapRow(row: IRoleRow): ICustomRole {
        if (!row) {
            throw new NotFoundError('No project found');
        }

        return {
            id: row.id,
            name: row.name,
            description: row.description,
            type: row.type,
        };
    }

    destroy(): void {}
}

module.exports = RoleStore;
