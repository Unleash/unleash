import type { FC } from 'react';
import { useLastSeenColors } from 'component/feature/FeatureView/FeatureEnvironmentSeen/useLastSeenColors';
import { Box, styled, Typography } from '@mui/material';
import { ReactComponent as UsageLine } from 'assets/icons/usage-line.svg';
import { ReactComponent as UsageRate } from 'assets/icons/usage-rate.svg';
import { StyledIconWrapper } from 'component/feature/FeatureView/FeatureEnvironmentSeen/FeatureEnvironmentSeen';
import { flexRow } from 'themes/themeStyles';
import { TimeAgo } from 'component/common/TimeAgo/TimeAgo';
import { HtmlTooltip } from 'component/common/HtmlTooltip/HtmlTooltip';

type ProjectLastSeenProps = {
    date?: Date | number | string | null;
    hideLabel?: boolean;
};

const StyledContainer = styled(Box, {
    shouldForwardProp: (prop) => prop !== 'secondary',
})<{ secondary?: boolean }>(({ theme, secondary }) => ({
    ...flexRow,
    justifyContent: 'flex-start',
    textWrap: 'nowrap',
    width: '50%',
    gap: theme.spacing(1),
    cursor: 'default',
    color: secondary
        ? theme.palette.text.secondary
        : theme.palette.text.primary,
}));

const StyledIcon = styled(StyledIconWrapper)<{ background: string }>(
    ({ background }) => ({
        background,
        margin: 0,
    }),
);

const Title = ({ date }: Pick<ProjectLastSeenProps, 'date'>) => (
    <>
        <Typography
            component='span'
            sx={(theme) => ({ fontSize: theme.fontSizes.smallBody })}
        >
            Last usage reported:{' '}
            {date ? (
                <TimeAgo date={date} refresh={false} />
            ) : (
                <span>No activity</span>
            )}
        </Typography>
        <Typography
            sx={(theme) => ({
                color: theme.palette.text.secondary,
                fontSize: theme.fontSizes.smallerBody,
            })}
        >
            Across all flags in your project this is the last time usage metrics
            where reported from connected applications.
        </Typography>
    </>
);

export const ProjectLastSeen: FC<ProjectLastSeenProps> = ({
    date,
    hideLabel,
}) => {
    const getColor = useLastSeenColors();
    const { text, background } = getColor(date);

    return (
        <HtmlTooltip title={<Title date={date} />} arrow>
            <StyledContainer secondary={!date}>
                <StyledIcon background={background}>
                    {date ? (
                        <UsageRate stroke={text} />
                    ) : (
                        <UsageLine stroke={text} />
                    )}
                </StyledIcon>{' '}
                {!hideLabel &&
                    (date ? (
                        <TimeAgo date={date} refresh={false} />
                    ) : (
                        <div>No activity</div>
                    ))}
            </StyledContainer>
        </HtmlTooltip>
    );
};
