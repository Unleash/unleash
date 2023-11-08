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

    public async isSegmentUsedInActiveChangeRequests(
        segmentId: number,
    ): Promise<boolean> {
        // in theory, this is simple:
        // 1. get a list of active change requests
        // 2. check the change_request_events table for any changes that relate to the change request ids and have the `addStrategy` or `updateStrategy` actions
        // 3. See if any of those changes have the segment id in their list of changes

        // 2. check each item in their `features[].changes` prop
        // 3. For each change that has an `addStrategy` or `editStrategy` action, check its payload's `segments` property
        // 4. If the `segments` list contains the strategy we're targeting, return true
        throw new Error('Method not implemented.');
    }
}
