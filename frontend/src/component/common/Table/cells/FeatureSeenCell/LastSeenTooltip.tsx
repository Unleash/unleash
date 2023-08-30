import { styled, SxProps, Theme, Typography } from '@mui/material';
import TimeAgo from 'react-timeago';
import { IEnvironments, IFeatureEnvironment } from 'interfaces/featureToggle';
import { ConditionallyRender } from 'component/common/ConditionallyRender/ConditionallyRender';
import { useLastSeenColors } from 'component/feature/FeatureView/FeatureEnvironmentSeen/useLastSeenColors';
import { useFeatureMetricsTotal } from 'hooks/api/getters/useFeatureMetricsTotal/useFeatureMetricsTotal';
import { PrettifyLargeNumber } from 'component/common/PrettifyLargeNumber/PrettifyLargeNumber';
import { StyledDivider } from 'component/changeRequest/ChangeRequestOverview/ChangeRequestReviewStatus/ChangeRequestReviewStatus.styles';
import useUiConfig from 'hooks/api/getters/useUiConfig/useUiConfig';

const StyledDescription = styled(
    'div',
    {}
)(({ theme }) => ({
    width: '100%',
    maxWidth: theme.spacing(50),
    padding: theme.spacing(1),
    backgroundColor: theme.palette.background.paper,
    color: theme.palette.text.secondary,
    fontSize: theme.fontSizes.smallBody,
    borderRadius: theme.shape.borderRadiusMedium,
}));

const StyledDescriptionBlock = styled('div')({
    display: 'flex',
    flexDirection: 'row',
});

const StyledDescriptionHeader = styled('p')(({ theme }) => ({
    color: theme.palette.text.primary,
    fontSize: theme.fontSizes.smallBody,
    fontWeight: theme.fontWeight.bold,
    marginBottom: theme.spacing(1),
}));

const StyledDescriptionBlockHeader = styled('p')(({ theme }) => ({
    color: theme.palette.text.primary,
    fontSize: theme.fontSizes.smallBody,
    fontWeight: theme.fontWeight.bold,
    marginBottom: theme.spacing(1),
    width: '50%',
}));

const StyledDescriptionSubHeader = styled('p')(({ theme }) => ({
    fontSize: theme.fontSizes.smallBody,
    margin: theme.spacing(2, 0),
}));

const StyledValueContainer = styled('div')({
    width: '50%',
});

const StyledValue = styled('div', {
    shouldForwardProp: prop => prop !== 'color',
})(({ color }) => ({
    textAlign: 'left',
    width: '100%',
    color: color,
}));

interface ILastSeenTooltipProps {
    featureId: string;
    featureLastSeen: string;
    environments?: IEnvironments[] | IFeatureEnvironment[];
    className?: string;
    sx?: SxProps<Theme>;
}

export const LastSeenTooltip = ({
    featureId,
    environments,
    featureLastSeen,
    ...rest
}: ILastSeenTooltipProps) => {
    const { uiConfig } = useUiConfig();
    const { data: metricsTotal } = useFeatureMetricsTotal(featureId);

    const getColor = useLastSeenColors();
    const [, defaultTextColor] = getColor();
    const environmentsHaveLastSeen = environments?.some(environment =>
        Boolean(environment.lastSeenAt)
    );
    return (
        <StyledDescription {...rest}>
            <StyledDescriptionHeader sx={{ mb: 0 }}>
                Last usage reported
            </StyledDescriptionHeader>
            <StyledDescriptionSubHeader>
                Usage is reported from connected applications through metrics
            </StyledDescriptionSubHeader>
            <ConditionallyRender
                condition={
                    Boolean(environments) && Boolean(environmentsHaveLastSeen)
                }
                show={
                    <>
                        {environments?.map(({ name, lastSeenAt }) => (
                            <StyledDescriptionBlock key={name}>
                                <StyledDescriptionBlockHeader>
                                    {name}
                                </StyledDescriptionBlockHeader>
                                <StyledValueContainer>
                                    <ConditionallyRender
                                        condition={Boolean(lastSeenAt)}
                                        show={
                                            <TimeAgo
                                                date={lastSeenAt!}
                                                title=""
                                                live={false}
                                                formatter={(
                                                    value: number,
                                                    unit: string,
                                                    suffix: string
                                                ) => {
                                                    const [, textColor] =
                                                        getColor(unit);
                                                    return (
                                                        <StyledValue
                                                            color={textColor}
                                                        >
                                                            {`${value} ${unit}${
                                                                value !== 1
                                                                    ? 's'
                                                                    : ''
                                                            } ${suffix}`}
                                                        </StyledValue>
                                                    );
                                                }}
                                            />
                                        }
                                        elseShow={
                                            <StyledValue
                                                color={defaultTextColor}
                                            >
                                                no usage
                                            </StyledValue>
                                        }
                                    />
                                </StyledValueContainer>
                            </StyledDescriptionBlock>
                        ))}
                    </>
                }
                elseShow={
                    <TimeAgo
                        date={featureLastSeen}
                        title=""
                        live={false}
                        formatter={(
                            value: number,
                            unit: string,
                            suffix: string
                        ) => {
                            const [, textColor] = getColor(unit);
                            return (
                                <Typography
                                    fontWeight={'bold'}
                                    color={'text.primary'}
                                >
                                    {`Reported ${value} ${unit}${
                                        value !== 1 ? 's' : ''
                                    } ${suffix}`}
                                </Typography>
                            );
                        }}
                    />
                }
            />
            <ConditionallyRender
                condition={Boolean(uiConfig.flags.totalMetricsCount)}
                show={
                    <>
                        <StyledDivider />
                        <StyledDescriptionHeader sx={{ mb: 0 }}>
                            Total metrics count
                        </StyledDescriptionHeader>
                        <StyledDescriptionSubHeader>
                            Total evaluations for this feature reported from
                            connected applications through metrics
                        </StyledDescriptionSubHeader>
                        {environments?.map(({ name }) => {
                            const { total } = metricsTotal?.find(
                                ({ environment }) => environment === name
                            ) || { total: 0 };
                            return (
                                <StyledDescriptionBlock key={name}>
                                    <StyledDescriptionBlockHeader>
                                        {name}
                                    </StyledDescriptionBlockHeader>
                                    <StyledValueContainer>
                                        <ConditionallyRender
                                            condition={Boolean(total)}
                                            show={
                                                <StyledValue
                                                    color={defaultTextColor}
                                                >
                                                    <PrettifyLargeNumber
                                                        value={total}
                                                    />{' '}
                                                    times
                                                </StyledValue>
                                            }
                                            elseShow={
                                                <StyledValue
                                                    color={defaultTextColor}
                                                >
                                                    no usage
                                                </StyledValue>
                                            }
                                        />
                                    </StyledValueContainer>
                                </StyledDescriptionBlock>
                            );
                        })}
                    </>
                }
            />
        </StyledDescription>
    );
};
