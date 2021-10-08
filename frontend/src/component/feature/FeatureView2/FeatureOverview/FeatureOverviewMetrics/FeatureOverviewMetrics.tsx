import { useParams } from 'react-router';
import { useState, useEffect } from 'react';
import useFeature from '../../../../../hooks/api/getters/useFeature/useFeature';
import { IFeatureViewParams } from '../../../../../interfaces/params';
import { IEnvironmentMetrics } from '../../../../../interfaces/environments';
import FeatureEnvironmentMetrics from '../FeatureEnvironmentMetrics/FeatureEnvironmentMetrics';
import { useStyles } from './FeatureOverviewMetrics.styles';

const data = {
    version: 1,
    maturity: 'experimental',
    lastHourUsage: [
        {
            environment: 'default',
            timestamp: '2021-10-07 10:00:00',
            yes: 250,
            no: 60,
        },
        {
            environment: 'production',
            timestamp: '2021-10-07 10:00:00',
            yes: 200,
            no: 500,
        },
        {
            environment: 'development',
            timestamp: '2021-10-07 10:00:00',
            yes: 0,
            no: 0,
        },
    ],
    seenApplications: ['web', 'backend-api', 'commerce'],
};

const FeatureOverviewMetrics = () => {
    const styles = useStyles();
    const { projectId, featureId } = useParams<IFeatureViewParams>();
    const { feature } = useFeature(projectId, featureId);
    const [featureMetrics, setFeatureMetrics] = useState<IEnvironmentMetrics[]>(
        []
    );

    useEffect(() => {
        const featureMetricList = feature?.environments.map(env => {
            const metrics = data.lastHourUsage.find(
                metric => metric.environment === env.name
            );

            if (!metrics) {
                return {
                    name: env.name,
                    yes: 0,
                    no: 0,
                    timestamp: '',
                };
            }

            return {
                name: env.name,
                yes: metrics.yes,
                no: metrics.no,
                timestamp: metrics.timestamp,
            };
        });

        setFeatureMetrics(featureMetricList);
        /* Update on useSWR metrics change */
        /* eslint-disable-next-line */
    }, []);

    const renderFeatureMetrics = () => {
        if (featureMetrics.length === 0) {
            return null;
        }

        if (featureMetrics.length === 1) {
            return (
                <FeatureEnvironmentMetrics
                    primaryMetric
                    metric={featureMetrics[0]}
                />
            );
        }

        if (featureMetrics.length === 2) {
            return featureMetrics.map((metric, index) => {
                if (index === 0) {
                    return (
                        <FeatureEnvironmentMetrics
                            className={styles.firstContainer}
                            key={metric.name}
                            metric={metric}
                        />
                    );
                }
                return (
                    <FeatureEnvironmentMetrics
                        key={metric.name}
                        metric={metric}
                    />
                );
            });
        }

        /* We display maxium three environments metrics */
        if (featureMetrics.length >= 3) {
            return featureMetrics.slice(0, 3).map((metric, index) => {
                if (index === 0) {
                    return (
                        <FeatureEnvironmentMetrics
                            primaryMetric
                            key={metric.name}
                            metric={metric}
                        />
                    );
                }

                if (index === 1) {
                    return (
                        <FeatureEnvironmentMetrics
                            className={styles.firstContainer}
                            key={metric.name}
                            metric={metric}
                        />
                    );
                }

                return (
                    <FeatureEnvironmentMetrics
                        key={metric.name}
                        metric={metric}
                    />
                );
            });
        }
    };

    return renderFeatureMetrics();
};

export default FeatureOverviewMetrics;
