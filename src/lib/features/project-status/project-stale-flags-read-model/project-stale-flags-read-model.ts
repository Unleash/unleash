import type { Db } from '../../../server-impl';
import type { IProjectStaleFlagsReadModel } from './project-stale-flags-read-model-type';

export class ProjectStaleFlagsReadModel implements IProjectStaleFlagsReadModel {
    constructor(private db: Db) {}

    async getStaleFlagCountForProject(projectId: string): Promise<number> {
        const result = await this.db('features')
            .count()
            .where({ project: projectId, archived: false })
            .where((builder) =>
                builder
                    .orWhere({ stale: true })
                    .orWhere({ potentially_stale: true }),
            );

        return Number(result[0].count);
    }
}
