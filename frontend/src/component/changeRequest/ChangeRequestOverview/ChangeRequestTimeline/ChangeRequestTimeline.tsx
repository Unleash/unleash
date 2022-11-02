import { FC } from 'react';
import { styled } from '@mui/material';
import { Box, Paper } from '@mui/material';
import Timeline from '@mui/lab/Timeline';
import TimelineItem, { timelineItemClasses } from '@mui/lab/TimelineItem';
import TimelineSeparator from '@mui/lab/TimelineSeparator';
import TimelineDot from '@mui/lab/TimelineDot';
import TimelineConnector from '@mui/lab/TimelineConnector';
import TimelineContent from '@mui/lab/TimelineContent';
import { ConditionallyRender } from 'component/common/ConditionallyRender/ConditionallyRender';
import { ChangeRequestState } from '../../changeRequest.types';
interface ISuggestChangeTimelineProps {
    state: ChangeRequestState;
}
interface ITimelineData {
    title: string;
    active: boolean;
}

const StyledPaper = styled(Paper)(({ theme }) => ({
    marginTop: theme.spacing(2),
    borderRadius: `${theme.shape.borderRadiusLarge}px`,
}));

const StyledBox = styled(Box)(({ theme }) => ({
    padding: theme.spacing(2),
    marginBottom: `-${theme.spacing(4)}`,
}));

const StyledTimeline = styled(Timeline)(() => ({
    [`& .${timelineItemClasses.root}:before`]: {
        flex: 0,
        padding: 0,
    },
}));

export const ChangeRequestTimeline: FC<ISuggestChangeTimelineProps> = ({
    state,
}) => {
    const createTimeLineData = (state: ChangeRequestState): ITimelineData[] => {
        const steps: ChangeRequestState[] = [
            'Draft',
            'In review',
            'Approved',
            'Applied',
        ];

        return steps.map(step => ({
            title: step,
            active: step === state,
        }));
    };

    const renderTimeline = () => {
        const data = createTimeLineData(state);
        const index = data.findIndex(item => item.active);
        const activeIndex: number | null = index !== -1 ? index : null;

        if (state === 'Cancelled') {
            return createCancelledTimeline(data);
        }

        return createTimeline(data, activeIndex);
    };

    return (
        <StyledPaper elevation={0}>
            <StyledBox>
                <StyledTimeline>{renderTimeline()}</StyledTimeline>
            </StyledBox>
        </StyledPaper>
    );
};

const createTimeline = (data: ITimelineData[], activeIndex: number | null) => {
    return data.map(({ title }, index) => {
        const shouldConnectToNextItem = index < data.length - 1;

        const connector = (
            <ConditionallyRender
                condition={shouldConnectToNextItem}
                show={<TimelineConnector />}
            />
        );

        if (activeIndex !== null && activeIndex >= index) {
            return createTimelineItem('success', title, connector);
        }

        if (activeIndex !== null && activeIndex + 1 === index) {
            return createTimelineItem('primary', title, connector, {
                variant: 'outlined',
            });
        }

        return createTimelineItem('grey', title, connector);
    });
};

const createCancelledTimeline = (data: ITimelineData[]) => {
    return data.map(({ title }, index) => {
        const shouldConnectToNextItem = index < data.length - 1;

        const connector = (
            <ConditionallyRender
                condition={shouldConnectToNextItem}
                show={<TimelineConnector />}
            />
        );
        return createTimelineItem('grey', title, connector);
    });
};

const createTimelineItem = (
    color: 'primary' | 'success' | 'grey',
    title: string,
    connector: JSX.Element,
    timelineDotProps: { [key: string]: string } = {}
) => {
    return (
        <TimelineItem key={title}>
            <TimelineSeparator>
                <TimelineDot color={color} {...timelineDotProps} />
                {connector}
            </TimelineSeparator>
            <TimelineContent>{title}</TimelineContent>
        </TimelineItem>
    );
};
