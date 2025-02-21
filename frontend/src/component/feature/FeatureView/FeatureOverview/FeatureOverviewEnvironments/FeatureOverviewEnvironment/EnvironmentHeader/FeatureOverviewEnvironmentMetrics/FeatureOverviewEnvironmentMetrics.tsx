import type { IFeatureEnvironmentMetrics } from 'interfaces/featureToggle';
import { calculatePercentage } from 'utils/calculatePercentage';
import { PrettifyLargeNumber } from 'component/common/PrettifyLargeNumber/PrettifyLargeNumber';
import { styled } from '@mui/material';
import { PercentageDonut } from 'component/common/PercentageCircle/PercentageDonut';

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
    // [theme.breakpoints.down('xl')]: {
    //     display: 'none',
    // },
}));

const StyledPercentageCircle = styled('div')(({ theme }) => ({
    marginRight: theme.spacing(1),
    [theme.breakpoints.down(500)]: {
        display: 'none',
    },
}));

type FeatureOverviewEnvironmentMetrics = {
    environmentMetric?: Pick<IFeatureEnvironmentMetrics, 'yes' | 'no'>;
    disabled?: boolean;
};

const FeatureOverviewEnvironmentMetrics = ({
    environmentMetric,
}: FeatureOverviewEnvironmentMetrics) => {
    if (!environmentMetric) return null;

    const total = environmentMetric.yes + environmentMetric.no;
    const percentage = calculatePercentage(total, environmentMetric?.yes);

    const isEmpty =
        !environmentMetric ||
        (environmentMetric.yes === 0 && environmentMetric.no === 0);

    return (
        <StyledContainer>
            <StyledInfo>
                {/* <StyledPercentage>{percentage}%</StyledPercentage> */}
                {isEmpty ? (
                    <StyledInfoParagraph>
                        No evaluation metrics
                        <br />
                        received in the last hour
                    </StyledInfoParagraph>
                ) : (
                    <StyledInfoParagraph>
                        The flag has been evaluated{' '}
                        <b>
                            <PrettifyLargeNumber value={total} /> times
                        </b>
                        <br />
                        and enabled{' '}
                        <b>
                            <PrettifyLargeNumber
                                value={environmentMetric.yes}
                            />{' '}
                            times
                        </b>{' '}
                        in the last hour
                    </StyledInfoParagraph>
                )}
            </StyledInfo>
            <StyledPercentageCircle data-loading>
                <PercentageDonut percentage={percentage} size='3rem' />
            </StyledPercentageCircle>
        </StyledContainer>
    );
};

export default FeatureOverviewEnvironmentMetrics;
