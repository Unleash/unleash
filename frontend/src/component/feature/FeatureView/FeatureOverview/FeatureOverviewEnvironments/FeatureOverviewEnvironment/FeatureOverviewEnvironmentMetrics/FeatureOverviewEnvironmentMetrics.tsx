import { FiberManualRecord } from '@mui/icons-material';
import { useTheme } from '@mui/system';
import { IFeatureEnvironmentMetrics } from 'interfaces/featureToggle';
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
    marginRight: theme.spacing(1),
    display: 'flex',
    flexDirection: 'column',
}));

const StyledPercentage = styled('p')(({ theme }) => ({
    color: theme.palette.primary.main,
    textAlign: 'right',
    fontSize: theme.fontSizes.bodySize,
}));

const StyledInfoParagraph = styled('p')(({ theme }) => ({
    maxWidth: '270px',
    marginTop: theme.spacing(0.5),
    fontSize: theme.fontSizes.smallBody,
    textAlign: 'right',
    [theme.breakpoints.down(700)]: {
        display: 'none',
    },
}));

const StyledIcon = styled(FiberManualRecord)(({ theme }) => ({
    fill: theme.palette.background.elevation2,
    height: '75px',
    width: '75px',
    [theme.breakpoints.down(500)]: {
        display: 'none',
    },
}));

const StyledPercentageCircle = styled('div')(({ theme }) => ({
    margin: theme.spacing(0, 2),
    [theme.breakpoints.down(500)]: {
        display: 'none',
    },
}));

const FeatureOverviewEnvironmentMetrics = ({
    environmentMetric,
    disabled = false,
}: IFeatureOverviewEnvironmentMetrics) => {
    const theme = useTheme();

    if (!environmentMetric) return null;

    const total = environmentMetric.yes + environmentMetric.no;
    const percentage = calculatePercentage(total, environmentMetric?.yes);

    if (
        !environmentMetric ||
        (environmentMetric.yes === 0 && environmentMetric.no === 0)
    ) {
        return (
            <StyledContainer>
                <StyledInfo>
                    <StyledPercentage
                        style={{
                            color: disabled
                                ? theme.palette.text.secondary
                                : undefined,
                        }}
                        data-loading
                    >
                        {percentage}%
                    </StyledPercentage>
                    <StyledInfoParagraph
                        style={{
                            color: disabled
                                ? theme.palette.text.secondary
                                : theme.palette.text.primary,
                        }}
                        data-loading
                    >
                        The feature has been requested <b>0 times</b> and
                        exposed
                        <b> 0 times</b> in the last hour
                    </StyledInfoParagraph>
                </StyledInfo>
                <StyledIcon style={{ transform: 'scale(1.1)' }} data-loading />
            </StyledContainer>
        );
    }

    return (
        <StyledContainer>
            <StyledInfo>
                <StyledPercentage>{percentage}%</StyledPercentage>
                <StyledInfoParagraph>
                    The feature has been requested{' '}
                    <b>
                        <PrettifyLargeNumber value={total} /> times
                    </b>{' '}
                    and exposed{' '}
                    <b>
                        <PrettifyLargeNumber value={environmentMetric.yes} />{' '}
                        times
                    </b>{' '}
                    in the last hour
                </StyledInfoParagraph>
            </StyledInfo>
            <StyledPercentageCircle data-loading>
                <PercentageCircle percentage={percentage} size="3rem" />
            </StyledPercentageCircle>
        </StyledContainer>
    );
};

export default FeatureOverviewEnvironmentMetrics;
