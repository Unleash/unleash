import { IFeatureMetricsRaw } from 'interfaces/featureToggle';
import { useMemo } from 'react';
import {
    FeatureMetricsStats,
    IFeatureMetricsStatsProps,
} from './FeatureMetricsStats';

interface IFeatureMetricsStatsRawProps
    extends Omit<IFeatureMetricsStatsProps, 'totalYes' | 'totalNo'> {
    metrics: IFeatureMetricsRaw[];
}

export const FeatureMetricsStatsRaw = ({
    metrics,
    ...rest
}: IFeatureMetricsStatsRawProps) => {
    const totalYes = useMemo(() => {
        return metrics.reduce((acc, m) => acc + m.yes, 0);
    }, [metrics]);

    const totalNo = useMemo(() => {
        return metrics.reduce((acc, m) => acc + m.no, 0);
    }, [metrics]);

    return (
        <FeatureMetricsStats {...rest} totalYes={totalYes} totalNo={totalNo} />
    );
};
