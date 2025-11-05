import type { FC } from 'react';
import {
    Box,
    IconButton,
    styled,
    type Theme,
    Typography,
    useTheme,
} from '@mui/material';
import { useLocationSettings } from 'hooks/useLocationSettings';
import {
    StyledOuterContainer,
    StyledButtonContainer,
    StyledReviewStatusContainer,
    StyledFlexAlignCenterBox,
    StyledSuccessIcon,
    StyledWarningIcon,
    StyledReviewTitle,
    StyledDivider,
    StyledScheduledIcon,
    StyledEditIcon,
    StyledScheduledBox,
    StyledErrorIcon,
    StyledScheduleFailedIcon,
    StyledScheduleSuspendedIcon,
} from './ChangeRequestReviewStatus.styles';
import type {
    ChangeRequestState,
    ChangeRequestType,
    ChangeRequestSchedule,
    ChangeRequestScheduleFailed,
    ChangeRequestSchedulePending,
    ChangeRequestScheduleSuspended,
} from 'component/changeRequest/changeRequest.types';
import { getBrowserTimezone } from './utils.ts';
import { formatDateYMDHMS } from 'utils/formatDate';
import { ChangeRequestIcon } from 'component/common/ChangeRequestIcon/ChangeRequestIcon.tsx';

interface ISuggestChangeReviewsStatusProps {
    changeRequest: ChangeRequestType;
    onEditClick?: () => void;
}
const resolveBorder = (state: ChangeRequestState, theme: Theme) => {
    if (state === 'Approved' || state === 'Scheduled') {
        return `2px solid ${theme.palette.success.main}`;
    }

    if (state === 'Applied') {
        return `2px solid ${theme.palette.primary.main}`;
    }

    return `1px solid ${theme.palette.divider}`;
};

const resolveIconColors = (state: ChangeRequestState, theme: Theme) => {
    if (state === 'Approved') {
        return {
            bgColor: theme.palette.success.main!,
            svgColor: theme.palette.background.paper,
        };
    }

    if (state === 'Applied') {
        return {
            bgColor: theme.palette.primary.main!,
            svgColor: theme.palette.background.paper,
        };
    }

    return {
        bgColor: theme.palette.background.elevation2,
        svgColor: theme.palette.neutral.main!,
    };
};

export const ChangeRequestReviewStatus: FC<
    ISuggestChangeReviewsStatusProps
> = ({ changeRequest, onEditClick }) => {
    const theme = useTheme();
    return (
        <StyledOuterContainer>
            <StyledButtonContainer
                {...resolveIconColors(changeRequest.state, theme)}
            >
                <ChangeRequestIcon />
            </StyledButtonContainer>
            <StyledReviewStatusContainer
                sx={{
                    backgroundColor:
                        changeRequest.state === 'In review'
                            ? theme.palette.warning.light
                            : 'initial',
                }}
                border={resolveBorder(changeRequest.state, theme)}
            >
                <ResolveComponent
                    changeRequest={changeRequest}
                    onEditClick={onEditClick}
                />
            </StyledReviewStatusContainer>
        </StyledOuterContainer>
    );
};

interface IResolveComponentProps {
    changeRequest: ChangeRequestType;
    onEditClick?: () => void;
}

const ResolveComponent = ({
    changeRequest,
    onEditClick,
}: IResolveComponentProps) => {
    const { state } = changeRequest;

    if (!state) {
        return null;
    }

    if (state === 'Approved') {
        return <Approved />;
    }

    if (state === 'Applied') {
        return <Applied />;
    }

    if (state === 'Cancelled') {
        return <Cancelled />;
    }

    if (state === 'Rejected') {
        return <Rejected />;
    }

    if (state === 'Scheduled') {
        const { schedule } = changeRequest;
        return <Scheduled schedule={schedule} onEditClick={onEditClick} />;
    }

    return <ReviewRequired minApprovals={changeRequest.minApprovals} />;
};

const Approved = () => {
    const theme = useTheme();

    return (
        <>
            <StyledFlexAlignCenterBox>
                <StyledSuccessIcon />
                <Box>
                    <StyledReviewTitle color={theme.palette.success.dark}>
                        Changes approved
                    </StyledReviewTitle>
                    <Typography>
                        One approving review from requested approvers
                    </Typography>
                </Box>
            </StyledFlexAlignCenterBox>

            <StyledDivider />

            <StyledFlexAlignCenterBox>
                <StyledSuccessIcon />
                <Box>
                    <StyledReviewTitle color={theme.palette.success.dark}>
                        Changes are ready to be applied
                    </StyledReviewTitle>
                </Box>
            </StyledFlexAlignCenterBox>
        </>
    );
};

interface IReviewRequiredProps {
    minApprovals: number;
}

const ReviewRequired = ({ minApprovals }: IReviewRequiredProps) => {
    const theme = useTheme();

    return (
        <>
            <StyledFlexAlignCenterBox>
                <StyledWarningIcon />
                <Box>
                    <StyledReviewTitle color={theme.palette.warning.dark}>
                        Review required
                    </StyledReviewTitle>
                    <Typography>
                        At least {minApprovals} approval(s) must be submitted
                        before changes can be applied
                    </Typography>
                </Box>
            </StyledFlexAlignCenterBox>

            <StyledDivider />

            <StyledFlexAlignCenterBox>
                <StyledWarningIcon />
                <StyledReviewTitle color={theme.palette.warning.dark}>
                    Apply changes is blocked
                </StyledReviewTitle>
            </StyledFlexAlignCenterBox>
        </>
    );
};

const Applied = () => {
    const theme = useTheme();

    return (
        <>
            <StyledFlexAlignCenterBox>
                <StyledSuccessIcon sx={{ color: theme.palette.primary.main }} />
                <Box>
                    <StyledReviewTitle color={theme.palette.primary.main}>
                        Changes applied
                    </StyledReviewTitle>
                </Box>
            </StyledFlexAlignCenterBox>
        </>
    );
};

const StyledIconButton = styled(IconButton)({
    maxWidth: '32px',
    maxHeight: '32px',
});

interface IScheduledProps {
    schedule?: ChangeRequestSchedule;
    onEditClick?: () => any;
}
const Scheduled = ({ schedule, onEditClick }: IScheduledProps) => {
    const theme = useTheme();

    if (!schedule) {
        return null;
    }

    const scheduleStatusBox = (() => {
        switch (schedule.status) {
            case 'pending':
                return <ScheduledPending schedule={schedule} />;
            case 'failed':
                return <ScheduledFailed schedule={schedule} />;
            case 'suspended':
                return <ScheduledSuspended schedule={schedule} />;
            default:
                return null;
        }
    })();

    return (
        <>
            <StyledFlexAlignCenterBox>
                <StyledSuccessIcon />
                <Box>
                    <StyledReviewTitle color={theme.palette.success.dark}>
                        Changes approved
                    </StyledReviewTitle>
                    <Typography>
                        One approving review from requested approvers
                    </Typography>
                </Box>
            </StyledFlexAlignCenterBox>

            <StyledDivider />

            <StyledScheduledBox>
                {scheduleStatusBox}
                <StyledIconButton onClick={onEditClick}>
                    <StyledEditIcon />
                </StyledIconButton>
            </StyledScheduledBox>
        </>
    );
};

const ScheduledFailed = ({
    schedule,
}: { schedule: ChangeRequestScheduleFailed }) => {
    const theme = useTheme();
    const timezone = getBrowserTimezone();
    const { locationSettings } = useLocationSettings();

    const scheduledTime = formatDateYMDHMS(
        new Date(schedule?.scheduledAt),
        locationSettings?.locale,
    );

    return (
        <StyledFlexAlignCenterBox>
            <StyledScheduleFailedIcon />
            <Box>
                <StyledReviewTitle color={theme.palette.error.main}>
                    Changes failed to be applied on {scheduledTime} because of{' '}
                    {schedule.reason ?? schedule.failureReason}
                </StyledReviewTitle>
                <Typography>Your timezone is {timezone}</Typography>
            </Box>
        </StyledFlexAlignCenterBox>
    );
};
const ScheduledSuspended = ({
    schedule,
}: { schedule: ChangeRequestScheduleSuspended }) => {
    const theme = useTheme();
    const timezone = getBrowserTimezone();
    const { locationSettings } = useLocationSettings();

    const scheduledTime = formatDateYMDHMS(
        new Date(schedule?.scheduledAt),
        locationSettings?.locale,
    );

    return (
        <StyledFlexAlignCenterBox>
            <StyledScheduleSuspendedIcon />
            <Box>
                <StyledReviewTitle color={theme.palette.text.secondary}>
                    The change request is suspended for the following reason:{' '}
                    {schedule.reason}
                </StyledReviewTitle>
                <StyledReviewTitle color={theme.palette.text.secondary}>
                    It will not be applied on {scheduledTime}.
                </StyledReviewTitle>
                <Typography>Your timezone is {timezone}</Typography>
            </Box>
        </StyledFlexAlignCenterBox>
    );
};

const ScheduledPending = ({
    schedule,
}: { schedule: ChangeRequestSchedulePending }) => {
    const theme = useTheme();
    const timezone = getBrowserTimezone();
    const { locationSettings } = useLocationSettings();

    const scheduledTime = formatDateYMDHMS(
        new Date(schedule?.scheduledAt),
        locationSettings?.locale,
    );

    return (
        <StyledFlexAlignCenterBox>
            <StyledScheduledIcon />
            <Box>
                <StyledReviewTitle color={theme.palette.warning.dark}>
                    Changes are scheduled to be applied on: {scheduledTime}
                </StyledReviewTitle>
                <Typography>Your timezone is {timezone}</Typography>
            </Box>
        </StyledFlexAlignCenterBox>
    );
};
const Cancelled = () => {
    const theme = useTheme();

    return (
        <>
            <StyledFlexAlignCenterBox>
                <StyledErrorIcon />
                <Box>
                    <StyledReviewTitle color={theme.palette.error.main}>
                        Changes cancelled
                    </StyledReviewTitle>
                </Box>
            </StyledFlexAlignCenterBox>
        </>
    );
};

const Rejected = () => {
    const theme = useTheme();

    return (
        <>
            <StyledFlexAlignCenterBox>
                <StyledErrorIcon />
                <Box>
                    <StyledReviewTitle color={theme.palette.error.main}>
                        Changes rejected
                    </StyledReviewTitle>
                </Box>
            </StyledFlexAlignCenterBox>
        </>
    );
};
