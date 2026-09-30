import type { Db } from '../../db/db.js';
import type {
    IPageQuery,
    ITagTypeWithUsage,
    ITagUsageReadModel,
    ITagValuesUsage,
} from './tag-usage-read-model-type.js';

export class TagUsageReadModel implements ITagUsageReadModel {
    private db: Db;

    constructor(db: Db) {
        this.db = db;
    }

    async getTagTypesWithUsage(
        projects?: string[],
    ): Promise<ITagTypeWithUsage[]> {
        const projectFilter = projects ? 'WHERE features.project = ANY(?)' : '';
        const queryResult = await this.db.raw(
            `WITH value_counts AS (
                SELECT type, COUNT(*) AS value_count FROM tags GROUP BY type
            ),
            project_usage AS (
                SELECT DISTINCT feature_tag.tag_type, features.project
                FROM feature_tag
                JOIN features ON features.name = feature_tag.feature_name
                ${projectFilter}
            ),
            project_counts AS (
                SELECT tag_type, COUNT(*) AS used_in_projects
                FROM project_usage
                GROUP BY tag_type
            )
            SELECT tag_types.name, tag_types.description, tag_types.icon,
                tag_types.color,
                COALESCE(value_counts.value_count, 0) AS value_count,
                COALESCE(project_counts.used_in_projects, 0) AS used_in_projects
            FROM tag_types
            LEFT JOIN value_counts ON value_counts.type = tag_types.name
            LEFT JOIN project_counts ON project_counts.tag_type = tag_types.name`,
            projects ? [projects] : [],
        );

        return queryResult.rows.map((row) => ({
            name: row.name,
            description: row.description,
            icon: row.icon,
            color: row.color,
            valueCount: Number(row.value_count),
            usedInProjects: Number(row.used_in_projects),
        }));
    }

    async getTagValueUsage(
        type: string,
        { limit, offset }: IPageQuery,
        projects?: string[],
    ): Promise<ITagValuesUsage> {
        // Values are global (GET /api/admin/tags/:type lists them all), so only the
        // flag counts are filtered by project; every value of the type is listed.
        const projectFilter = projects ? 'AND features.project = ANY(?)' : '';
        const [queryResult, countResult] = await Promise.all([
            this.db.raw(
                `WITH page AS (
                    SELECT value FROM tags WHERE type = ?
                    ORDER BY value LIMIT ? OFFSET ?
                )
                SELECT page.value,
                    COUNT(features.name) FILTER (WHERE features.archived_at IS NULL) AS used_in_active_features,
                    COUNT(features.name) FILTER (WHERE features.archived_at IS NOT NULL) AS used_in_archived_features
                FROM page
                LEFT JOIN feature_tag
                    ON feature_tag.tag_type = ? AND feature_tag.tag_value = page.value
                LEFT JOIN features
                    ON features.name = feature_tag.feature_name ${projectFilter}
                GROUP BY page.value
                ORDER BY page.value`,
                [type, limit, offset, type, ...(projects ? [projects] : [])],
            ),
            this.db('tags').where({ type }).count('* as count').first(),
        ]);

        return {
            total: Number(countResult?.count ?? 0),
            tagValues: queryResult.rows.map((row) => ({
                value: row.value,
                usedInActiveFeatures: Number(row.used_in_active_features),
                usedInArchivedFeatures: Number(row.used_in_archived_features),
            })),
        };
    }
}
