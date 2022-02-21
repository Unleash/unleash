import { IFeatureMetricsRaw } from '../../../../../interfaces/featureToggle';
import { useMemo } from 'react';
import { FeatureMetricsStats } from './FeatureMetricsStats';

interface IFeatureMetricsStatsRawProps {
    metrics: IFeatureMetricsRaw[];
    hoursBack: number;
}

export const FeatureMetricsStatsRaw = ({
    metrics,
    hoursBack,
}: IFeatureMetricsStatsRawProps) => {
    const totalYes = useMemo(() => {
        return metrics.reduce((acc, m) => acc + m.yes, 0);
    }, [metrics]);

    const totalNo = useMemo(() => {
        return metrics.reduce((acc, m) => acc + m.no, 0);
    }, [metrics]);

    return (
        <FeatureMetricsStats
            totalYes={totalYes}
            totalNo={totalNo}
            hoursBack={hoursBack}
        />
    );
};
