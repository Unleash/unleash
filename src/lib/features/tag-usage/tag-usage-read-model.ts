import type { Db } from '../../db/db.js';
import type {
    ITagTypeWithUsage,
    ITagUsageReadModel,
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
}
