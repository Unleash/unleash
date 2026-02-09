import { ulid } from 'ulidx';
import type { ReleasePlanTemplate } from './release-plan-template.js';
import type { ReleasePlanMilestone } from './release-plan-milestone.js';
import { CRUDStore, type CrudStoreConfig } from '../../db/crud/crud-store.js';
import type { Row } from '../../db/crud/row-type.js';
import type { Db } from '../../db/db.js';
import { NotFoundError } from '../../error/index.js';

const TABLE = 'release_plan_definitions';

export type ReleasePlanTemplateWriteModel = Omit<
    ReleasePlanTemplate,
    'id' | 'createdAt' | 'milestones'
>;

const fromRow = (row: any): ReleasePlanTemplate => {
    return {
        id: row.id,
        name: row.name,
        createdAt: row.created_at,
        description: row.description,
        discriminator: row.discriminator,
        createdByUserId: row.created_by_user_id,
    };
};

export class ReleasePlanTemplateStore extends CRUDStore<
    ReleasePlanTemplate,
    ReleasePlanTemplateWriteModel,
    Row<ReleasePlanTemplate>,
    ReleasePlanTemplate,
    string
> {
    constructor(db: Db, config: CrudStoreConfig) {
        super(TABLE, db, config);
    }

    override async getAll(): Promise<ReleasePlanTemplate[]> {
        const endTimer = this.timer('getAll');
        const templates = await this.db<ReleasePlanTemplate>(TABLE)
            .where('discriminator', 'template')
            .where('archived_at', null)
            .whereNot('name', '__blank__') // Filter out system template for inline milestones
            .orderBy('created_at');
        endTimer();
        return templates.map(({ milestones, ...template }) =>
            fromRow(template),
        );
    }

    override async count(
        query?: Partial<ReleasePlanTemplateWriteModel>,
    ): Promise<number> {
        let countQuery = this.db(this.tableName)
            .where('discriminator', 'template')
            .whereNull('archived_at')
            .whereNot('name', '__blank__') // Filter out system template for inline milestones
            .count('*');
        if (query) {
            countQuery = countQuery.where(this.toRow(query));
        }
        const { count } = (await countQuery.first()) ?? { count: 0 };
        return Number(count);
    }

    async checkNameAlreadyExists(name: string, id?: string): Promise<boolean> {
        const exists = await this.db(TABLE)
            .where('discriminator', 'template')
            .where({ name })
            .modify((qb) => {
                if (id) {
                    qb.whereNot('id', id);
                }
            })
            .first()
            .select('id');

        return Boolean(exists);
    }

    async getByName(name: string): Promise<ReleasePlanTemplate | undefined> {
        const endTimer = this.timer('getByName');
        const template = await this.db<ReleasePlanTemplate>(TABLE)
            .where('discriminator', 'template')
            .where('name', name)
            .first();
        endTimer();
        if (!template) {
            return undefined;
        }
        const { milestones, ...rest } = template;
        return fromRow(rest);
    }

    async getBlankSystemTemplate(): Promise<ReleasePlanTemplate | undefined> {
        return this.getByName('__blank__');
    }

    processReleasePlanTemplateRows(templateRows): ReleasePlanTemplate {
        return {
            id: templateRows[0].templateId,
            discriminator: templateRows[0].templateDiscriminator,
            name: templateRows[0].templateName,
            description: templateRows[0].templateDescription,
            createdByUserId: templateRows[0].templateCreatedByUserId,
            createdAt: templateRows[0].templateCreatedAt,
            milestones: templateRows.reduce(
                (acc: ReleasePlanMilestone[], row) => {
                    if (!row.milestoneId) {
                        return acc;
                    }
                    let milestone = acc.find((m) => m.id === row.milestoneId);
                    if (!milestone) {
                        milestone = {
                            id: row.milestoneId,
                            name: row.milestoneName,
                            sortOrder: row.milestoneSortOrder,
                            strategies: [],
                            releasePlanDefinitionId: row.templateId,
                        };
                        acc.push(milestone);
                    }
                    if (!row.strategyId) {
                        return acc;
                    }
                    let strategy = milestone.strategies?.find(
                        (s) => s.id === row.strategyId,
                    );
                    if (!strategy) {
                        strategy = {
                            id: row.strategyId,
                            milestoneId: row.milestoneId,
                            sortOrder: row.strategySortOrder,
                            title: row.strategyTitle,
                            strategyName: row.strategyName,
                            parameters: row.strategyParameters ?? {},
                            constraints: row.strategyConstraints,
                            variants: row.strategyVariants ?? [],
                            segments: [],
                        };
                        milestone.strategies = [
                            ...(milestone.strategies || []),
                            strategy,
                        ];
                    }

                    if (row.segmentId) {
                        strategy.segments = [
                            ...(strategy.segments || []),
                            row.segmentId,
                        ];
                    }

                    return acc;
                },
                [],
            ),
            archivedAt: templateRows[0].templateArchivedAt,
        };
    }

    async getById(id: string): Promise<ReleasePlanTemplate> {
        const endTimer = this.timer('getById');
        const templateRows = await this.db(`${TABLE} AS rpd`)
            .where('rpd.id', id)
            .leftJoin(
                'milestones AS mi',
                'mi.release_plan_definition_id',
                'rpd.id',
            )
            .leftJoin('milestone_strategies AS ms', 'ms.milestone_id', 'mi.id')
            .leftJoin(
                'milestone_strategy_segments AS mss',
                'mss.milestone_strategy_id',
                'ms.id',
            )
            .orderBy('mi.sort_order', 'asc')
            .orderBy('ms.sort_order', 'asc')
            .select(
                'rpd.id AS templateId',
                'rpd.discriminator AS templateDiscriminator',
                'rpd.name AS templateName',
                'rpd.description as templateDescription',
                'rpd.created_by_user_id as templateCreatedByUserId',
                'rpd.created_at as templateCreatedAt',
                'rpd.archived_at AS templateArchivedAt',
                'mi.id AS milestoneId',
                'mi.name AS milestoneName',
                'mi.sort_order AS milestoneSortOrder',
                'ms.id AS strategyId',
                'ms.sort_order AS strategySortOrder',
                'ms.title AS strategyTitle',
                'ms.strategy_name AS strategyName',
                'ms.parameters AS strategyParameters',
                'ms.constraints AS strategyConstraints',
                'ms.variants AS strategyVariants',
                'mss.segment_id AS segmentId',
            );
        endTimer();

        if (!templateRows.length) {
            throw new NotFoundError(`Could not find template with id ${id}`);
        }

        return this.processReleasePlanTemplateRows(templateRows);
    }

    override async insert(
        item: ReleasePlanTemplateWriteModel,
    ): Promise<ReleasePlanTemplate> {
        const endTimer = this.timer('insert');
        const row = this.toRow(item);
        row.id = ulid();
        await this.db(TABLE).insert(row);
        endTimer();
        return fromRow(row);
    }

    async archive(id: string): Promise<void> {
        const endTimer = this.timer('archive');
        const now = new Date();
        await this.db(TABLE).where('id', id).update({ archived_at: now });
        endTimer();
    }
}
