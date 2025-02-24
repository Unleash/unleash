import type { IFeatureEnvironmentMetrics } from 'interfaces/featureToggle';
import { calculatePercentage } from 'utils/calculatePercentage';
import { PrettifyLargeNumber } from 'component/common/PrettifyLargeNumber/PrettifyLargeNumber';
import {
    styled,
    Tooltip,
    tooltipClasses,
    type TooltipProps,
} from '@mui/material';
import { PercentageDonut } from 'component/common/PercentageCircle/PercentageDonut';

const StyledContainer = styled('div')(({ theme }) => ({
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-end',
}));

const StyledInfo = styled('p')(({ theme }) => ({
    fontSize: theme.typography.body2.fontSize,
    textAlign: 'right',
    [theme.breakpoints.down('xl')]: {
        display: 'none',
    },
    display: 'flex',
    flexDirection: 'column',
    flexGrow: 1,
    span: {
        textWrap: 'nowrap',
    },
}));

const StyledPercentageCircle = styled('div')(({ theme }) => ({
    marginRight: theme.spacing(1),
    marginLeft: theme.spacing(1.5),
    [theme.breakpoints.down(500)]: {
        display: 'none',
    },
}));

const StyledTooltip = styled(({ className, ...props }: TooltipProps) => (
    <Tooltip {...props} classes={{ popper: className }} />
))({
    [`& .${tooltipClasses.tooltip}`]: {
        maxWidth: 200,
    },
});

type FeatureOverviewEnvironmentMetrics = {
    environmentMetric?: Pick<IFeatureEnvironmentMetrics, 'yes' | 'no'>;
    collapsed?: boolean;
};

const FeatureOverviewEnvironmentMetrics = ({
    environmentMetric,
    collapsed,
}: FeatureOverviewEnvironmentMetrics) => {
    if (!environmentMetric) return null;

    const total = environmentMetric.yes + environmentMetric.no;
    const percentage = calculatePercentage(total, environmentMetric?.yes);

    const isEmpty =
        !environmentMetric ||
        (environmentMetric.yes === 0 && environmentMetric.no === 0);

    const content = isEmpty ? (
        <>
            No evaluation metrics
            <br />
            received in the last hour
        </>
    ) : (
        <>
            <span>
                The flag has been evaluated{' '}
                <b>
                    <PrettifyLargeNumber value={total} /> times
                </b>
            </span>{' '}
            <span>
                and enabled{' '}
                <b>
                    <PrettifyLargeNumber value={environmentMetric.yes} /> times
                </b>{' '}
                in the last hour
            </span>
        </>
    );

    return (
        <StyledContainer>
            {!collapsed ? <StyledInfo>{content}</StyledInfo> : null}
            <StyledTooltip title={collapsed ? content : ''} arrow>
                <StyledPercentageCircle data-loading>
                    <PercentageDonut percentage={percentage} size='3rem'>
                        {!isEmpty ? `${percentage}%` : null}
                    </PercentageDonut>
                </StyledPercentageCircle>
            </StyledTooltip>
        </StyledContainer>
    );
};

export default FeatureOverviewEnvironmentMetrics;
