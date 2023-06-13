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
    InstanceStatsSigned,
} from '../../services/instance-stats-service';
import { OpenApiService } from '../../services/openapi-service';
import {
    createCsvResponseSchema,
    createResponseSchema,
} from '../../openapi/util/create-response-schema';

class InstanceAdminController extends Controller {
    private instanceStatsService: InstanceStatsService;

    private openApiService: OpenApiService;

    private jsonCsvParser: Parser;

    constructor(
        config: IUnleashConfig,
        {
            instanceStatsService,
            openApiService,
        }: Pick<IUnleashServices, 'instanceStatsService' | 'openApiService'>,
    ) {
        super(config);
        this.jsonCsvParser = new Parser();
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
                            'instanceAdminStatsSchemaCsv',
                            this.jsonCsvParser.parse(
                                this.instanceStatsExample(),
                            ),
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

    instanceStatsExample(): InstanceStatsSigned {
        return {
            OIDCenabled: true,
            SAMLenabled: false,
            clientApps: [
                { range: 'allTime', count: 15 },
                { range: '30d', count: 9 },
                { range: '7d', count: 5 },
            ],
            contextFields: 6,
            environments: 2,
            featureExports: 0,
            featureImports: 0,
            featureToggles: 29,
            groups: 3,
            instanceId: 'ed3861ae-78f9-4e8c-8e57-b57efc15f82b',
            projects: 1,
            roles: 5,
            segments: 2,
            strategies: 8,
            sum: 'some-sha256-hash',
            timestamp: new Date(2023, 6, 12, 10, 0, 0, 0),
            users: 10,
            versionEnterprise: '5.1.7',
            versionOSS: '5.1.7',
        };
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
