import { styled, Typography } from '@mui/material';
import type { ISegment } from 'interfaces/segment';
import { RecentlyUsedSegmentChip } from './RecentlyUsedSegmentChip.tsx';

type RecentlyUsedSegmentsProps = {
    setSegments: React.Dispatch<React.SetStateAction<ISegment[]>>;
    segments: ISegment[];
};

const StyledContainer = styled('div')(({ theme }) => ({
    marginTop: theme.spacing(3),
}));

const StyledHeader = styled(Typography)(({ theme }) => ({
    fontSize: theme.fontSizes.smallerBody,
    color: theme.palette.text.secondary,
    marginBottom: theme.spacing(1),
}));

const StyledSegmentsContainer = styled('div')(({ theme }) => ({
    display: 'flex',
    flexWrap: 'wrap',
    gap: theme.spacing(1),
}));

export const RecentlyUsedSegments = ({
    setSegments,
    segments,
}: RecentlyUsedSegmentsProps) => {
    return (
        <StyledContainer>
            <StyledHeader>Recently used segments</StyledHeader>
            <StyledSegmentsContainer>
                {segments.map((segment) => (
                    <RecentlyUsedSegmentChip
                        key={segment.id}
                        segment={segment}
                        setSegments={setSegments}
                    />
                ))}
            </StyledSegmentsContainer>
        </StyledContainer>
    );
};
