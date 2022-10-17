import { Parser } from 'json2csv';
import { Response } from 'express';
import { AuthedRequest } from '../../types/core';
import { IUnleashServices } from '../../types/services';
import { IUnleashConfig } from '../../types/option';
import Controller from '../controller';
import { NONE } from '../../types/permissions';
import { UiConfigSchema } from '../../openapi/spec/ui-config-schema';
import { InstanceStatsService } from '../../services/instance-stats-service';

class InstanceAdminController extends Controller {
    private instanceStatsService: InstanceStatsService;

    constructor(
        config: IUnleashConfig,
        {
            instanceStatsService,
        }: Pick<IUnleashServices, 'instanceStatsService'>,
    ) {
        super(config);
        this.instanceStatsService = instanceStatsService;

        this.route({
            method: 'get',
            path: '/statistics/csv',
            handler: this.getStatistics,
            permission: NONE,
        });
    }

    async getStatistics(
        req: AuthedRequest,
        res: Response<UiConfigSchema>,
    ): Promise<void> {
        const instanceStats = await this.instanceStatsService.getSignedStats();
        const fileName = `unleash-${
            instanceStats.instanceId
        }-${Date.now()}.csv`;

        const json2csvParser = new Parser();
        const csv = json2csvParser.parse(instanceStats);

        res.contentType('csv');
        res.attachment(fileName);
        res.send(csv);
    }
}

export default InstanceAdminController;
