import type { FC } from 'react';
import { useLastSeenColors } from 'component/feature/FeatureView/FeatureEnvironmentSeen/useLastSeenColors';
import { Box, styled } from '@mui/material';
import { ReactComponent as UsageLine } from 'assets/icons/usage-line.svg';
import { ReactComponent as UsageRate } from 'assets/icons/usage-rate.svg';
import { StyledIconWrapper } from 'component/feature/FeatureView/FeatureEnvironmentSeen/FeatureEnvironmentSeen';
import { flexRow } from 'themes/themeStyles';
import TimeAgo from 'component/common/TimeAgo/TimeAgo';

type ProjectLastSeenProps = {
    date?: Date | number | string | null;
};

const StyledContainer = styled(Box)(({ theme }) => ({
    ...flexRow,
    justifyContent: 'flex-start',
    textWrap: 'nowrap',
    width: '50%',
    gap: theme.spacing(1),
}));

const StyledIcon = styled(StyledIconWrapper)<{ background: string }>(
    ({ background }) => ({
        background,
        margin: 0,
    }),
);

export const ProjectLastSeen: FC<ProjectLastSeenProps> = ({ date }) => {
    const getColor = useLastSeenColors();
    const { text, background } = getColor(date);

    if (!date) {
        return (
            <StyledContainer
                sx={(theme) => ({ color: theme.palette.text.secondary })}
            >
                <StyledIcon background={background}>
                    <UsageLine stroke={text} />
                </StyledIcon>{' '}
                <div>No activity</div>
            </StyledContainer>
        );
    }

    return (
        <StyledContainer>
            <StyledIcon background={background}>
                <UsageRate stroke={text} />
            </StyledIcon>{' '}
            <TimeAgo date={date} />
        </StyledContainer>
    );
};
