import type { Logger } from '../../logger.js';
import type { IUnleashConfig } from '../../types/index.js';

interface PrometheusResponse {
    status: string;
    data: any;
}

interface MetricSeries {
    name: string;
    available: boolean;
    labels: Record<string, string[]>;
}

export interface IImpactMetricsService {
    getMetricsFromPrometheus(): Promise<{
        availableMetrics: MetricSeries[];
        totalCount: number;
    }>;
}

// TODO: URL
const prometheusUrl = 'http://localhost:9090';

export default class ImpactMetricsService implements IImpactMetricsService {
    private logger: Logger;
    private config: IUnleashConfig;

    constructor(config: IUnleashConfig) {
        this.logger = config.getLogger(
            'impact-metrics/impact-metrics-service.ts',
        );
        this.config = config;
    }

    async getMetricsFromPrometheus(): Promise<{
        availableMetrics: MetricSeries[];
        totalCount: number;
    }> {
        const testingMetrics = [
            'node_cpu_seconds_total',
            'node_load5',
            'node_memory_MemAvailable_bytes',
            'node_disk_read_bytes_total',
            'node_disk_written_bytes_total',
            'node_network_receive_bytes_total',
            'node_network_transmit_bytes_total',
            'node_filesystem_avail_bytes',
            'node_filesystem_size_bytes',
        ];

        try {
            this.logger.info('Fetching all metrics from Prometheus');

            const metricsResponse = await fetch(
                `${prometheusUrl}/api/v1/label/__name__/values`,
            );

            if (!metricsResponse.ok) {
                throw new Error(
                    `Failed to fetch metrics: ${metricsResponse.status}`,
                );
            }

            const metricsData =
                (await metricsResponse.json()) as PrometheusResponse;
            if (metricsData.status !== 'success') {
                throw new Error('Prometheus API returned error status');
            }

            const allMetrics: string[] = metricsData.data;
            this.logger.info(
                `Found ${allMetrics.length} total metrics in Prometheus`,
            );

            const availableMetrics: MetricSeries[] = [];

            for (const metricName of testingMetrics) {
                const isAvailable = allMetrics.includes(metricName);

                let labels: Record<string, string[]> = {};

                if (isAvailable) {
                    try {
                        const seriesUrl = `${prometheusUrl}/api/v1/series?match[]=${encodeURIComponent(metricName)}`;
                        this.logger.debug(
                            `Fetching series for metric: ${metricName}`,
                        );

                        const seriesResponse = await fetch(seriesUrl);
                        const seriesData =
                            (await seriesResponse.json()) as PrometheusResponse;
                        if (seriesData.status === 'success') {
                            const labelMap: Record<string, Set<string>> = {};

                            seriesData.data.forEach(
                                (series: Record<string, string>) => {
                                    Object.entries(series).forEach(
                                        ([key, value]) => {
                                            if (key !== '__name__') {
                                                if (!labelMap[key]) {
                                                    labelMap[key] = new Set();
                                                }
                                                labelMap[key].add(value);
                                            }
                                        },
                                    );
                                },
                            );

                            labels = Object.fromEntries(
                                Object.entries(labelMap).map(
                                    ([key, valueSet]) => [
                                        key,
                                        Array.from(valueSet).sort(),
                                    ],
                                ),
                            );
                        }
                    } catch (error) {
                        this.logger.warn(
                            `Failed to fetch labels for metric ${metricName}:`,
                            error,
                        );
                    }
                }

                availableMetrics.push({
                    name: metricName,
                    available: isAvailable,
                    labels,
                });

                this.logger.debug(
                    `Metric ${metricName}: available=${isAvailable}, labelCount=${Object.keys(labels).length}`,
                );
            }

            const availableCount = availableMetrics.filter(
                (m) => m.available,
            ).length;
            this.logger.info(
                `Found ${availableCount}/${testingMetrics.length} test metrics available in Prometheus`,
            );

            return {
                availableMetrics,
                totalCount: allMetrics.length,
            };
        } catch (error) {
            this.logger.error('Error fetching metrics from Prometheus:', error);
            throw error;
        }
    }
}
