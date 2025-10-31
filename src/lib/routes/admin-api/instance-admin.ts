import { Parser } from 'json2csv';
import type { Response } from 'express';
import type { AuthedRequest } from '../../types/core.js';
import type { IUnleashServices } from '../../services/index.js';
import type { IUnleashConfig } from '../../types/option.js';
import Controller from '../controller.js';
import { NONE } from '../../types/permissions.js';
import type {
    InstanceStatsService,
    InstanceStatsSigned,
} from '../../features/instance-stats/instance-stats-service.js';
import type { OpenApiService } from '../../services/openapi-service.js';
import {
    createCsvResponseSchema,
    createResponseSchema,
} from '../../openapi/util/create-response-schema.js';
import type { InstanceAdminStatsSchema } from '../../openapi/index.js';
import { serializeDates } from '../../types/index.js';

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
                }),
            ],
        });
    }

    instanceStatsExample(): InstanceStatsSigned {
        return {
            OIDCenabled: true,
            SAMLenabled: false,
            passwordAuthEnabled: true,
            SCIMenabled: false,
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
            archivedFeatureToggles: 10,
            groups: 3,
            instanceId: 'ed3861ae-78f9-4e8c-8e57-b57efc15f82b',
            projects: 4,
            roles: 5,
            customRootRoles: 2,
            customRootRolesInUse: 1,
            segments: 2,
            strategies: 8,
            sum: 'some-sha256-hash',
            timestamp: new Date(2023, 6, 12, 10, 0, 0, 0),
            users: 10,
            licensedUsers: 12,
            serviceAccounts: 2,
            apiTokens: new Map([]),
            versionEnterprise: '5.1.7',
            versionOSS: '5.1.7',
            activeUsers: {
                last90: 15,
                last60: 12,
                last30: 10,
                last7: 5,
            },
            productionChanges: {
                last30: 100,
                last60: 200,
                last90: 200,
            },
            previousDayMetricsBucketsCount: {
                variantCount: 100,
                enabledCount: 200,
            },
            maxEnvironmentStrategies: 20,
            maxConstraints: 17,
            maxConstraintValues: 123,
            releaseTemplates: 3,
            releasePlans: 5,
            edgeInstances: {
                lastMonth: 10,
                monthBeforeLast: 15,
                last12Months: 12,
            },
        };
    }

    private serializeStats(
        instanceStats: InstanceStatsSigned,
    ): InstanceAdminStatsSchema {
        const apiTokensObj = Object.fromEntries(
            instanceStats.apiTokens.entries(),
        );
        return serializeDates({
            ...instanceStats,
            apiTokens: apiTokensObj,
        });
    }

    async getStatistics(
        _: AuthedRequest,
        res: Response<InstanceAdminStatsSchema>,
    ): Promise<void> {
        const instanceStats = await this.instanceStatsService.getSignedStats();
        res.json(this.serializeStats(instanceStats));
    }

    async getStatisticsCSV(
        _: AuthedRequest,
        res: Response<InstanceAdminStatsSchema>,
    ): Promise<void> {
        const instanceStats = await this.instanceStatsService.getSignedStats();
        const fileName = `unleash-${
            instanceStats.instanceId
        }-${Date.now()}.csv`;

        const json2csvParser = new Parser();
        const csv = json2csvParser.parse(this.serializeStats(instanceStats));

        res.contentType('csv');
        res.attachment(fileName);
        res.send(csv);
    }
}

export default InstanceAdminController;
