import { Parser } from 'json2csv';
import { Response } from 'express';
import { AuthedRequest } from '../../types/core';
import { IUnleashServices } from '../../types/services';
import { IUnleashConfig } from '../../types/option';
import Controller from '../controller';
import { NONE } from '../../types/permissions';
import { UiConfigSchema } from '../../openapi/spec/ui-config-schema';
import {
    InstanceStats,
    InstanceStatsService,
} from '../../services/instance-stats-service';
import { OpenApiService } from '../../services/openapi-service';
import {
    createCsvResponseSchema,
    createResponseSchema,
} from '../../openapi/util/create-response-schema';

class InstanceAdminController extends Controller {
    private instanceStatsService: InstanceStatsService;

    private openApiService: OpenApiService;

    constructor(
        config: IUnleashConfig,
        {
            instanceStatsService,
            openApiService,
        }: Pick<IUnleashServices, 'instanceStatsService' | 'openApiService'>,
    ) {
        super(config);

        this.openApiService = openApiService;
        this.instanceStatsService = instanceStatsService;

        this.route({
            method: 'get',
            path: '/statistics/csv',
            handler: this.getStatisticsCSV,
            permission: NONE,
            middleware: [
                openApiService.validPath({
                    tags: ['Instance Admin'],
                    summary: 'Instance usage statistics',
                    description:
                        'Provides statistics about various features of Unleash to allow for reporting of usage for self-hosted customers. The response contains data such as the number of users, groups, features, strategies, versions, etc.',
                    operationId: 'getInstanceAdminStatsCsv',
                    responses: {
                        200: createCsvResponseSchema(
                            'instanceAdminStatsSchema',
                        ),
                    },
                }),
            ],
        });

        this.route({
            method: 'get',
            path: '/statistics',
            handler: this.getStatistics,
            permission: NONE,
            middleware: [
                openApiService.validPath({
                    tags: ['Instance Admin'],
                    operationId: 'getInstanceAdminStats',
                    summary: 'Instance usage statistics',
                    description:
                        'Provides statistics about various features of Unleash to allow for reporting of usage for self-hosted customers. The response contains data such as the number of users, groups, features, strategies, versions, etc.',
                    responses: {
                        200: createResponseSchema('instanceAdminStatsSchema'),
                    },
                    deprecated: true,
                }),
            ],
        });
    }

    async getStatistics(
        req: AuthedRequest,
        res: Response<InstanceStats>,
    ): Promise<void> {
        const instanceStats = await this.instanceStatsService.getSignedStats();
        res.json(instanceStats);
    }

    async getStatisticsCSV(
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
