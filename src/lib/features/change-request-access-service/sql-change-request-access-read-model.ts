import { SKIP_CHANGE_REQUEST } from '../../types/index.js';
import type { Db } from '../../db/db.js';
import type { AccessService } from '../../services/index.js';
import type User from '../../types/user.js';
import type { IChangeRequestAccessReadModel } from './change-request-access-read-model.js';

export class ChangeRequestAccessReadModel
    implements IChangeRequestAccessReadModel
{
    private db: Db;

    private accessService: AccessService;

    constructor(db: Db, accessService: AccessService) {
        this.db = db;
        this.accessService = accessService;
    }

    public async canBypassChangeRequest(
        project: string,
        environment: string,
        user?: User,
    ): Promise<boolean> {
        const [canSkipChangeRequest, changeRequestEnabled] = await Promise.all([
            user
                ? this.accessService.hasPermission(
                      user,
                      SKIP_CHANGE_REQUEST,
                      project,
                      environment,
                  )
                : Promise.resolve(false),
            this.isChangeRequestsEnabled(project, environment),
        ]);
        return canSkipChangeRequest || !changeRequestEnabled;
    }

    public async canBypassChangeRequestForProject(
        project: string,
        user?: User,
    ): Promise<boolean> {
        const [canSkipChangeRequest, changeRequestEnabled] = await Promise.all([
            user
                ? this.accessService.hasPermission(
                      user,
                      SKIP_CHANGE_REQUEST,
                      project,
                  )
                : Promise.resolve(false),
            this.isChangeRequestsEnabledForProject(project),
        ]);
        return canSkipChangeRequest || !changeRequestEnabled;
    }

    public async isChangeRequestsEnabled(
        project: string,
        environment: string,
    ): Promise<boolean> {
        const result = await this.db.raw(
            `SELECT EXISTS(SELECT 1
                           FROM change_request_settings
                           WHERE environment = ?
                             and project = ?) AS present`,
            [environment, project],
        );
        const { present } = result.rows[0];
        return present;
    }

    public async isChangeRequestsEnabledForProject(
        project: string,
    ): Promise<boolean> {
        const result = await this.db('change_request_settings')
            .join('project_environments', function () {
                return this.on(
                    'change_request_settings.project',
                    'project_environments.project_id',
                ).andOn(
                    'change_request_settings.environment',
                    'project_environments.environment_name',
                );
            })
            .where('change_request_settings.project', project)
            .select('change_request_settings.project')
            .first();

        return Boolean(result);
    }
}
