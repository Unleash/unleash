import { FC } from 'react';
import { Box, Paper, styled, Tooltip, Typography } from '@mui/material';
import Timeline from '@mui/lab/Timeline';
import TimelineItem, { timelineItemClasses } from '@mui/lab/TimelineItem';
import TimelineSeparator from '@mui/lab/TimelineSeparator';
import TimelineDot from '@mui/lab/TimelineDot';
import TimelineConnector from '@mui/lab/TimelineConnector';
import TimelineContent from '@mui/lab/TimelineContent';
import { ChangeRequestState } from '../../changeRequest.types';
import { ConditionallyRender } from '../../../common/ConditionallyRender/ConditionallyRender';
import { HtmlTooltip } from '../../../common/HtmlTooltip/HtmlTooltip';
import { Info } from '@mui/icons-material';
import { useLocationSettings } from 'hooks/useLocationSettings';
import { formatDateYMDHMS } from 'utils/formatDate';

interface ISuggestChangeTimelineProps {
    state: ChangeRequestState;
    scheduledAt?: string;
    failureReason?: string;
}

const StyledPaper = styled(Paper)(({ theme }) => ({
    marginTop: theme.spacing(2),
    borderRadius: `${theme.shape.borderRadiusLarge}px`,
}));

const StyledBox = styled(Box)(({ theme }) => ({
    padding: theme.spacing(2),
    marginBottom: `-${theme.spacing(4)}`,
}));

const StyledSubtitle = styled(Box)(({ theme }) => ({
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'flex-end',
}));

const StyledTimeline = styled(Timeline)(() => ({
    [`& .${timelineItemClasses.root}:before`]: {
        flex: 0,
        padding: 0,
    },
}));

const steps: ChangeRequestState[] = [
    'Draft',
    'In review',
    'Approved',
    'Applied',
];
const rejectedSteps: ChangeRequestState[] = ['Draft', 'In review', 'Rejected'];
const scheduledSteps: ChangeRequestState[] = [
    'Draft',
    'In review',
    'Approved',
    'Scheduled',
    'Applied',
];

export const determineColor = (
    changeRequestState: ChangeRequestState,
    changeRequestStateIndex: number,
    displayStage: ChangeRequestState,
    displayStageIndex: number,
    failureReason?: string,
) => {
    if (changeRequestState === 'Cancelled') return 'grey';

    if (changeRequestState === 'Rejected')
        return displayStage === 'Rejected' ? 'error' : 'success';
    if (
        changeRequestStateIndex !== -1 &&
        changeRequestStateIndex > displayStageIndex
    )
        return 'success';
    if (
        changeRequestStateIndex !== -1 &&
        changeRequestStateIndex === displayStageIndex
    ) {
        return changeRequestState === 'Scheduled'
            ? failureReason
                ? 'error'
                : 'warning'
            : 'success';
    }

    if (changeRequestStateIndex + 1 === displayStageIndex) return 'primary';
    return 'grey';
};

export const ChangeRequestTimeline: FC<ISuggestChangeTimelineProps> = ({
    state,
    scheduledAt,
    failureReason,
}) => {
    let data;
    switch (state) {
        case 'Rejected':
            data = rejectedSteps;
            break;
        case 'Scheduled':
            data = scheduledSteps;
            break;
        default:
            data = steps;
    }
    const activeIndex = data.findIndex((item) => item === state);

    const { locationSettings } = useLocationSettings();

    return (
        <StyledPaper elevation={0}>
            <StyledBox>
                <StyledTimeline>
                    {data.map((title, index) => {
                        const subtitle =
                            scheduledAt &&
                            state === 'Scheduled' &&
                            state === title
                                ? formatDateYMDHMS(
                                      new Date(scheduledAt),
                                      locationSettings?.locale,
                                  )
                                : undefined;
                        const color = determineColor(
                            state,
                            activeIndex,
                            title,
                            index,
                            failureReason,
                        );
                        let timelineDotProps = {};

                        // Only add the outlined variant if it's the next step after the active one, but not for 'Draft' in 'Cancelled' state
                        if (
                            activeIndex + 1 === index &&
                            !(state === 'Cancelled' && title === 'Draft')
                        ) {
                            timelineDotProps = { variant: 'outlined' };
                        }

                        return createTimelineItem(
                            color,
                            title,
                            subtitle,
                            failureReason,
                            index < data.length - 1,
                            timelineDotProps,
                        );
                    })}
                </StyledTimeline>
            </StyledBox>
        </StyledPaper>
    );
};

const createTimelineItem = (
    color: 'primary' | 'success' | 'grey' | 'error' | 'warning',
    title: string,
    subtitle: string | undefined,
    failureReason: string | undefined,
    shouldConnectToNextItem: boolean,
    timelineDotProps: { [key: string]: string | undefined } = {},
) => (
    <TimelineItem key={title}>
        <TimelineSeparator>
            <TimelineDot color={color} {...timelineDotProps} />
            {shouldConnectToNextItem && <TimelineConnector />}
        </TimelineSeparator>
        <TimelineContent>
            {title}
            <ConditionallyRender
                condition={Boolean(subtitle)}
                show={
                    <StyledSubtitle>
                        <Typography
                            color={'text.secondary'}
                            sx={{ mr: 1 }}
                        >{`(for ${subtitle})`}</Typography>
                        <ConditionallyRender
                            condition={Boolean(failureReason)}
                            show={
                                <HtmlTooltip
                                    title={`Schedule failed because of ${failureReason}`}
                                    arrow
                                >
                                    <Info color={'error'} fontSize={'small'} />
                                </HtmlTooltip>
                            }
                        />
                    </StyledSubtitle>
                }
            />
        </TimelineContent>
    </TimelineItem>
);
