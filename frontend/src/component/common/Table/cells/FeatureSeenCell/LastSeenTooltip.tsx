import { styled, type SxProps, type Theme, Typography } from '@mui/material';
import { TimeAgo } from 'component/common/TimeAgo/TimeAgo';
import type { ILastSeenEnvironments } from 'interfaces/featureToggle';
import { ConditionallyRender } from 'component/common/ConditionallyRender/ConditionallyRender';
import { useLastSeenColors } from 'component/feature/FeatureView/FeatureEnvironmentSeen/useLastSeenColors';
import { LastSeenProgress } from './LastSeenProgress/LastSeenProgress.tsx';

const StyledDescription = styled(
    'div',
    {},
)(({ theme }) => ({
    width: '100%',
    maxWidth: theme.spacing(50),
    padding: theme.spacing(1),
    backgroundColor: theme.palette.background.paper,
    color: theme.palette.text.secondary,
    fontSize: theme.fontSizes.smallBody,
    borderRadius: theme.shape.borderRadiusMedium,
}));

const StyledDescriptionBlock = styled('div')(({ theme }) => ({
    display: 'flex',
    flexWrap: 'wrap',
}));

const StyledDescriptionHeader = styled('p')(({ theme }) => ({
    color: theme.palette.text.primary,
    fontSize: theme.fontSizes.smallBody,
    marginBottom: theme.spacing(1),
}));

const StyledDescriptionBlockHeader = styled('p')(({ theme }) => ({
    color: theme.palette.text.primary,
    fontSize: theme.fontSizes.smallBody,
    fontWeight: theme.fontWeight.bold,
    marginBottom: theme.spacing(1),
    width: '40%',
    justifyContent: 'flex-start',
}));
const StyledValueContainer = styled('div')(({ theme }) => ({
    width: '40%',
    justifyContent: 'center',
    padding: theme.spacing(0, 1, 0, 1),
}));

const StyledDescriptionSubHeader = styled('p')(({ theme }) => ({
    fontSize: theme.fontSizes.smallBody,
}));

const StyledValue = styled('div', {
    shouldForwardProp: (prop) => prop !== 'color',
})(({ color }) => ({
    textAlign: 'left',
    width: '100%',
    color: color,
}));

const StyledListContainer = styled('div')(({ theme }) => ({
    maxHeight: theme.spacing(24.5),
    overflowY: 'auto',
    paddingRight: theme.spacing(2),
}));

interface ILastSeenTooltipProps {
    featureLastSeen: string;
    environments?: ILastSeenEnvironments[];
    className?: string;
    sx?: SxProps<Theme>;
}

export const LastSeenTooltip = ({
    environments,
    featureLastSeen,
    ...rest
}: ILastSeenTooltipProps) => {
    const getColor = useLastSeenColors();
    const environmentsHaveLastSeen = environments?.some((environment) =>
        Boolean(environment.lastSeenAt),
    );

    return (
        <StyledDescription {...rest} data-loading>
            <StyledDescriptionHeader>
                Last usage reported
            </StyledDescriptionHeader>
            <ConditionallyRender
                condition={
                    Boolean(environments) && Boolean(environmentsHaveLastSeen)
                }
                show={
                    <StyledListContainer>
                        {environments?.map(({ name, lastSeenAt, yes, no }) => (
                            <StyledDescriptionBlock key={name}>
                                <StyledDescriptionBlockHeader>
                                    {name}
                                </StyledDescriptionBlockHeader>
                                <StyledValueContainer>
                                    <StyledValue
                                        color={getColor(lastSeenAt).text}
                                    >
                                        <TimeAgo
                                            date={lastSeenAt}
                                            refresh={false}
                                            fallback='no usage'
                                        />
                                    </StyledValue>
                                </StyledValueContainer>
                                <LastSeenProgress yes={yes} no={no} />
                            </StyledDescriptionBlock>
                        ))}
                    </StyledListContainer>
                }
                elseShow={
                    <Typography
                        fontWeight={'bold'}
                        color={getColor(featureLastSeen).text}
                    >
                        Reported <TimeAgo date={featureLastSeen} />
                    </Typography>
                }
            />
            <StyledDescriptionSubHeader>
                Usage is reported from connected applications through metrics
            </StyledDescriptionSubHeader>
        </StyledDescription>
    );
};
