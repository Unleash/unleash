import { ulid } from 'ulidx';
import type {
    ReleasePlanMilestone,
    ReleasePlanMilestoneWriteModel,
} from './release-plan-milestone.js';
import { CRUDStore, type CrudStoreConfig } from '../../db/crud/crud-store.js';
import type { Row } from '../../db/crud/row-type.js';
import type { Db } from '../../db/db.js';

const TABLE = 'milestones';

const fromRow = (row: any): ReleasePlanMilestone => {
    return {
        id: row.id,
        name: row.name,
        sortOrder: row.sort_order,
        releasePlanDefinitionId: row.release_plan_definition_id,
        strategies: [],
    };
};

export class ReleasePlanMilestoneStore extends CRUDStore<
    ReleasePlanMilestone,
    ReleasePlanMilestoneWriteModel,
    Row<ReleasePlanMilestone>,
    ReleasePlanMilestone,
    string
> {
    constructor(db: Db, config: CrudStoreConfig) {
        super(TABLE, db, config);
    }

    override async insert(
        item: ReleasePlanMilestoneWriteModel,
    ): Promise<ReleasePlanMilestone> {
        const row = this.toRow(item);
        row.id = ulid();
        await this.db(TABLE).insert(row);
        return fromRow(row);
    }

    async deleteAllConnectedToReleasePlanTemplate(
        templateId: string,
    ): Promise<void> {
        await this.db(TABLE)
            .where('release_plan_definition_id', templateId)
            .delete();
    }

    async updateStartTime(milestoneId: string): Promise<void> {
        await this.db.raw(
            `UPDATE ${TABLE} SET started_at = NOW() WHERE id = ?`,
            [milestoneId],
        );
    }
}
