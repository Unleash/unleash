import type { IFeatureEnvironmentMetrics } from 'interfaces/featureToggle';
import { calculatePercentage } from 'utils/calculatePercentage';
import PercentageCircle from 'component/common/PercentageCircle/PercentageCircle';
import { PrettifyLargeNumber } from 'component/common/PrettifyLargeNumber/PrettifyLargeNumber';
import { styled } from '@mui/material';

interface IFeatureOverviewEnvironmentMetrics {
    environmentMetric?: IFeatureEnvironmentMetrics;
    disabled?: boolean;
}

const StyledContainer = styled('div')({
    marginLeft: 'auto',
    display: 'flex',
    alignItems: 'center',
});

const StyledInfo = styled('div')(({ theme }) => ({
    marginRight: theme.spacing(1.5),
    display: 'flex',
    flexDirection: 'column',
}));

const StyledPercentage = styled('p')(({ theme }) => ({
    color: theme.palette.primary.main,
    textAlign: 'right',
    fontSize: theme.fontSizes.bodySize,
}));

const StyledInfoParagraph = styled('p')(({ theme }) => ({
    fontSize: theme.typography.body2.fontSize,
    textAlign: 'right',
    [theme.breakpoints.down('xl')]: {
        display: 'none',
    },
}));

const StyledPercentageCircle = styled('div')(({ theme }) => ({
    marginRight: theme.spacing(1),
    [theme.breakpoints.down(500)]: {
        display: 'none',
    },
}));

const FeatureOverviewEnvironmentMetrics = ({
    environmentMetric,
    disabled = false,
}: IFeatureOverviewEnvironmentMetrics) => {
    if (!environmentMetric) return null;

    const total = environmentMetric.yes + environmentMetric.no;
    const percentage = calculatePercentage(total, environmentMetric?.yes);

    if (
        !environmentMetric ||
        (environmentMetric.yes === 0 && environmentMetric.no === 0)
    ) {
        return null;
    }

    return (
        <StyledContainer>
            <StyledInfo>
                <StyledPercentage>{percentage}%</StyledPercentage>
                <StyledInfoParagraph>
                    The flag has been requested{' '}
                    <b>
                        <PrettifyLargeNumber value={total} /> times
                    </b>
                    <br />
                    and exposed{' '}
                    <b>
                        <PrettifyLargeNumber value={environmentMetric.yes} />{' '}
                        times
                    </b>{' '}
                    in the last hour
                </StyledInfoParagraph>
            </StyledInfo>
            <StyledPercentageCircle data-loading>
                <PercentageCircle
                    percentage={percentage}
                    size='3rem'
                    strokeWidth={0.25}
                />
            </StyledPercentageCircle>
        </StyledContainer>
    );
};

export default FeatureOverviewEnvironmentMetrics;
