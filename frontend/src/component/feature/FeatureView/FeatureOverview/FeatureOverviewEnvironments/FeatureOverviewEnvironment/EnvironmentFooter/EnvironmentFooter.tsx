import { IFeatureEnvironmentMetrics } from 'interfaces/featureToggle';
import { FeatureMetricsStats } from 'component/feature/FeatureView/FeatureMetrics/FeatureMetricsStats/FeatureMetricsStats';
import { SectionSeparator } from '../SectionSeparator/SectionSeparator';

interface IEnvironmentFooterProps {
    environmentMetric?: IFeatureEnvironmentMetrics;
}

export const EnvironmentFooter = ({
    environmentMetric,
}: IEnvironmentFooterProps) => {
    if (!environmentMetric) {
        return null;
    }

    return (
        <>
            <SectionSeparator>Feature toggle exposure</SectionSeparator>

            <div>
                <FeatureMetricsStats
                    totalYes={environmentMetric.yes}
                    totalNo={environmentMetric.no}
                    hoursBack={1}
                />
            </div>
        </>
    );
};
