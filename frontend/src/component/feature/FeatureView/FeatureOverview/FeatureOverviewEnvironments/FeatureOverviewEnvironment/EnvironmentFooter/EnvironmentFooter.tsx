import type { IFeatureEnvironmentMetrics } from 'interfaces/featureToggle';
import { FeatureMetricsStats } from 'component/feature/FeatureView/FeatureMetrics/FeatureMetricsStats/FeatureMetricsStats';
import { SectionSeparator } from '../SectionSeparator/SectionSeparator';
import { styled } from '@mui/material';

const StyledLabel = styled('span')(({ theme }) => ({
    background: theme.palette.envAccordion.expanded,
    padding: theme.spacing(0, 2),
}));

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
            <SectionSeparator>
                <StyledLabel>Feature flag exposure</StyledLabel>
            </SectionSeparator>

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
