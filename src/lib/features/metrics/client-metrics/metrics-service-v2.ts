import type { Logger } from '../../../logger.js';
import type { IFlagResolver, IUnleashConfig } from '../../../types/index.js';
import type { ISdkHeartbeat, IUnleashStores } from '../../../types/index.js';
import type { ToggleMetricsSummary } from '../../../types/models/metrics.js';
import type {
    IClientMetricsEnv,
    IClientMetricsStoreV2,
} from './client-metrics-store-v2-type.js';
import { clientMetricsSchema } from '../shared/schema.js';
import { compareAsc, secondsToMilliseconds } from 'date-fns';
import {
    CLIENT_METRICS,
    CLIENT_METRICS_ADDED,
    CLIENT_REGISTER,
} from '../../../events/index.js';
import ApiUser, { type IApiUser } from '../../../types/api-user.js';
import { ALL } from '../../../types/models/api-token.js';
import type { IUser } from '../../../types/user.js';
import { collapseHourlyMetrics } from './collapseHourlyMetrics.js';
import type { LastSeenService } from '../last-seen/last-seen-service.js';
import {
    generateDayBuckets,
    generateHourBuckets,
    type HourBucket,
} from '../../../util/time-utils.js';
import type { ClientMetricsSchema } from '../../../../lib/openapi/index.js';
import { nameSchema } from '../../../schema/feature-schema.js';
import memoizee from 'memoizee';
import {
    MAX_UNKNOWN_FLAGS,
    type UnknownFlagsService,
} from '../unknown-flags/unknown-flags-service.js';

export default class ClientMetricsServiceV2 {
    private config: IUnleashConfig;

    private unsavedMetrics: IClientMetricsEnv[] = [];

    private clientMetricsStoreV2: IClientMetricsStoreV2;

    private lastSeenService: LastSeenService;

    private unknownFlagsService: UnknownFlagsService;

    private flagResolver: Pick<IFlagResolver, 'isEnabled' | 'getVariant'>;

    private logger: Logger;

    private cachedFeatureNames: () => Promise<string[]>;

    constructor(
        { clientMetricsStoreV2 }: Pick<IUnleashStores, 'clientMetricsStoreV2'>,
        config: IUnleashConfig,
        lastSeenService: LastSeenService,
        unknownFlagsService: UnknownFlagsService,
    ) {
        this.clientMetricsStoreV2 = clientMetricsStoreV2;
        this.lastSeenService = lastSeenService;
        this.unknownFlagsService = unknownFlagsService;
        this.config = config;
        this.logger = config.getLogger(
            '/services/client-metrics/client-metrics-service-v2.ts',
        );
        this.flagResolver = config.flagResolver;
        this.cachedFeatureNames = memoizee(
            async () => this.clientMetricsStoreV2.getFeatureFlagNames(),
            {
                promise: true,
                maxAge: secondsToMilliseconds(10),
            },
        );
    }

    async clearMetrics(hoursAgo: number) {
        try {
            await this.clientMetricsStoreV2.clearMetrics(hoursAgo);
        } catch (e) {
            this.logger.error(
                `Failed to clear client metrics older than ${hoursAgo} hours: ${e.message}`,
            );
        }
    }

    async clearDailyMetrics(daysAgo: number) {
        if (this.flagResolver.isEnabled('extendedUsageMetrics')) {
            return this.clientMetricsStoreV2.clearDailyMetrics(daysAgo);
        }
    }

    async aggregateDailyMetrics() {
        if (this.flagResolver.isEnabled('extendedUsageMetrics')) {
            const {
                enabledCount: hourlyEnabledCount,
                variantCount: hourlyVariantCount,
            } =
                await this.clientMetricsStoreV2.countPreviousDayHourlyMetricsBuckets();
            const {
                enabledCount: dailyEnabledCount,
                variantCount: dailyVariantCount,
            } =
                await this.clientMetricsStoreV2.countPreviousDayMetricsBuckets();
            const { payload } = this.flagResolver.getVariant(
                'extendedUsageMetrics',
            );

            const limit =
                payload?.value &&
                Number.isInteger(Number.parseInt(payload?.value))
                    ? Number.parseInt(payload?.value)
                    : 3600000;

            const totalHourlyCount = hourlyEnabledCount + hourlyVariantCount;
            const totalDailyCount = dailyEnabledCount + dailyVariantCount;
            const previousDayDailyCountCalculated =
                totalDailyCount > totalHourlyCount / 24; // heuristic

            if (previousDayDailyCountCalculated) {
                return;
            }
            if (totalHourlyCount > limit) {
                this.logger.warn(
                    `Skipping previous day metrics aggregation. Too many results. Expected max value: ${limit}, Actual value: ${totalHourlyCount}`,
                );
                return;
            }
            await this.clientMetricsStoreV2.aggregateDailyMetrics();
        }
    }

    async filterExistingToggleNames(toggleNames: string[]): Promise<{
        validatedToggleNames: string[];
        unknownToggleNames: string[];
    }> {
        let unknownToggleNames: string[] = [];

        const existingFlags = await this.cachedFeatureNames();
        const existingNames = toggleNames.filter((name) =>
            existingFlags.includes(name),
        );

        if (this.flagResolver.isEnabled('reportUnknownFlags')) {
            try {
                const nonExistingNames = toggleNames.filter(
                    (name) => !existingFlags.includes(name),
                );

                unknownToggleNames = nonExistingNames.slice(
                    0,
                    MAX_UNKNOWN_FLAGS,
                );
            } catch (e) {
                this.logger.error(e);
            }
        }

        const validatedToggleNames =
            await this.filterValidToggleNames(existingNames);

        return { validatedToggleNames, unknownToggleNames };
    }

    async filterValidToggleNames(toggleNames: string[]): Promise<string[]> {
        const nameValidations: Promise<
            PromiseFulfilledResult<{ name: string }> | PromiseRejectedResult
        >[] = toggleNames.map((toggleName) =>
            nameSchema.validateAsync({ name: toggleName }),
        );
        const badNames = (await Promise.allSettled(nameValidations)).filter(
            (r) => r.status === 'rejected',
        );
        if (badNames.length > 0) {
            this.logger.warn(
                `Got a few toggles with invalid names: ${JSON.stringify(
                    badNames,
                )}`,
            );

            if (this.flagResolver.isEnabled('filterInvalidClientMetrics')) {
                const justNames = badNames.map(
                    (r: PromiseRejectedResult) => r.reason._original.name,
                );
                return toggleNames.filter((name) => !justNames.includes(name));
            }
        }
        return toggleNames;
    }

    async registerBulkMetrics(metrics: IClientMetricsEnv[]): Promise<void> {
        this.unsavedMetrics = collapseHourlyMetrics([
            ...this.unsavedMetrics,
            ...metrics,
        ]);
        this.lastSeenService.updateLastSeen(metrics);
    }

    async registerClientMetrics(
        data: ClientMetricsSchema,
        clientIp: string,
    ): Promise<void> {
        const value = await clientMetricsSchema.validateAsync(data);
        const toggleNames = Object.keys(value.bucket.toggles).filter(
            (name) =>
                !(
                    value.bucket.toggles[name].yes === 0 &&
                    value.bucket.toggles[name].no === 0
                ),
        );

        const { validatedToggleNames, unknownToggleNames } =
            await this.filterExistingToggleNames(toggleNames);

        const invalidToggleNames =
            toggleNames.length - validatedToggleNames.length;
        this.logger.info(
            `Got ${toggleNames.length} (${invalidToggleNames > 0 ? `${invalidToggleNames} invalid ones` : 'all valid'}) metrics from ${value.appName}`,
        );

        if (data.sdkVersion) {
            const [sdkName, sdkVersion] = data.sdkVersion.split(':');
            const heartbeatEvent: ISdkHeartbeat = {
                sdkName,
                sdkVersion,
                metadata: {
                    platformName: data.platformName,
                    platformVersion: data.platformVersion,
                    yggdrasilVersion: data.yggdrasilVersion,
                    specVersion: data.specVersion,
                },
            };

            this.config.eventBus.emit(CLIENT_REGISTER, heartbeatEvent);
        }

        if (unknownToggleNames.length > 0) {
            const unknownFlags = unknownToggleNames.map((name) => ({
                name,
                appName: value.appName,
                seenAt: value.bucket.stop,
            }));
            this.logger.info(
                `Registering ${unknownFlags.length} unknown flags from ${value.appName}, i.e.: ${unknownFlags
                    .slice(0, 10)
                    .map((f) => f.name)
                    .join(', ')}`,
            );
            this.unknownFlagsService.register(unknownFlags);
        }

        if (validatedToggleNames.length > 0) {
            const clientMetrics: IClientMetricsEnv[] = validatedToggleNames.map(
                (name) => ({
                    featureName: name,
                    appName: value.appName,
                    environment: value.environment ?? 'default',
                    timestamp: value.bucket.stop, //we might need to approximate between start/stop...
                    yes: value.bucket.toggles[name].yes ?? 0,
                    no: value.bucket.toggles[name].no ?? 0,
                    variants: value.bucket.toggles[name].variants,
                }),
            );
            await this.registerBulkMetrics(clientMetrics);

            this.config.eventBus.emit(CLIENT_METRICS, clientMetrics);
        }
    }

    async bulkAdd(): Promise<void> {
        if (this.unsavedMetrics.length > 0) {
            try {
                // Make a copy of `unsavedMetrics` in case new metrics
                // arrive while awaiting `batchInsertMetrics`.
                const copy = [...this.unsavedMetrics];
                this.unsavedMetrics = [];
                await this.clientMetricsStoreV2.batchInsertMetrics(copy);
                this.config.eventBus.emit(CLIENT_METRICS_ADDED, copy);
            } catch (error) {
                this.logger.error(
                    `Failed to bulk add client metrics: ${error.message}`,
                );
            }
        }
    }

    // Overview over usage last "hour" bucket and all applications using the toggle
    async getFeatureToggleMetricsSummary(
        featureName: string,
    ): Promise<ToggleMetricsSummary> {
        const metrics =
            await this.clientMetricsStoreV2.getMetricsForFeatureToggle(
                featureName,
                1,
            );
        const seenApplications =
            await this.clientMetricsStoreV2.getSeenAppsForFeatureToggle(
                featureName,
            );

        const groupedMetrics = metrics.reduce((prev, curr) => {
            if (prev[curr.environment]) {
                prev[curr.environment].yes += curr.yes;
                prev[curr.environment].no += curr.no;
            } else {
                prev[curr.environment] = {
                    environment: curr.environment,
                    timestamp: curr.timestamp,
                    yes: curr.yes,
                    no: curr.no,
                };
            }
            return prev;
        }, {});

        return {
            featureName,
            lastHourUsage: Object.values(groupedMetrics),
            seenApplications,
        };
    }

    async getClientMetricsForToggle(
        featureName: string,
        hoursBack: number = 24,
    ): Promise<IClientMetricsEnv[]> {
        let hours: HourBucket[];
        let metrics: IClientMetricsEnv[];
        if (this.flagResolver.isEnabled('extendedUsageMetrics')) {
            // if we're in the daily range we need to add one more day
            const normalizedHoursBack =
                hoursBack > 48 ? hoursBack + 24 : hoursBack;
            metrics =
                await this.clientMetricsStoreV2.getMetricsForFeatureToggleV2(
                    featureName,
                    normalizedHoursBack,
                );
            hours =
                hoursBack > 48
                    ? generateDayBuckets(Math.floor(hoursBack / 24))
                    : generateHourBuckets(hoursBack);
        } else {
            metrics =
                await this.clientMetricsStoreV2.getMetricsForFeatureToggle(
                    featureName,
                    hoursBack,
                );
            hours = generateHourBuckets(hoursBack);
        }

        const environments = [...new Set(metrics.map((x) => x.environment))];

        const applications = [...new Set(metrics.map((x) => x.appName))].slice(
            0,
            100,
        );

        const result = environments.flatMap((environment) => {
            const environmentMetrics = metrics.filter(
                (metric) => metric.environment === environment,
            );
            return applications.flatMap((appName) => {
                const applicationMetrics = environmentMetrics.filter(
                    (metric) => metric.appName === appName,
                );
                return hours.flatMap((hourBucket) => {
                    const metric = applicationMetrics.find(
                        (item) =>
                            compareAsc(hourBucket.timestamp, item.timestamp) ===
                            0,
                    );
                    return (
                        metric || {
                            timestamp: hourBucket.timestamp,
                            no: 0,
                            yes: 0,
                            appName,
                            environment,
                            featureName,
                        }
                    );
                });
            });
        });
        return result.sort((a, b) => compareAsc(a.timestamp, b.timestamp));
    }

    resolveMetricsEnvironment(
        user: IUser | IApiUser,
        data: { environment?: string },
    ): string {
        if (user instanceof ApiUser) {
            if (user.environment !== ALL) {
                return user.environment;
            } else if (user.environment === ALL && data.environment) {
                return data.environment;
            }
        }
        return 'default';
    }

    resolveUserEnvironment(user: IUser | IApiUser): string {
        if (user instanceof ApiUser && user.environment !== ALL) {
            return user.environment;
        }
        return 'default';
    }
}
