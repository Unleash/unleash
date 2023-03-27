import { SKIP_CHANGE_REQUEST } from '../../types';
import { Db } from '../../db/db';
import { AccessService } from '../../services';
import User from '../../types/user';
import { IChangeRequestAccessReadModel } from './change-request-access-read-model';

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
        return !(changeRequestEnabled && !canSkipChangeRequest);
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
        const result = await this.db.raw(
            `SELECT EXISTS(SELECT 1
                           FROM change_request_settings
                           WHERE project = ?
                           ) AS present`,
            [project],
        );
        const { present } = result.rows[0];
        return present;
    }
}
