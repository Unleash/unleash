import { styled, Typography } from '@mui/material';
import { useRecentlyUsedSegments } from './useRecentlyUsedSegments.ts';
import type { ISegment } from 'interfaces/segment';
import { RecentlyUsedSegmentChip } from './RecentlyUsedSegmentChip.tsx';
import { useSegments } from 'hooks/api/getters/useSegments/useSegments';

type RecentlyUsedSegmentsProps = {
    setSegments?: React.Dispatch<React.SetStateAction<ISegment[]>>;
    segments?: ISegment[];
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
    segments = [],
}: RecentlyUsedSegmentsProps) => {
    const { items: recentlyUsedSegmentIds } = useRecentlyUsedSegments();
    const { segments: allSegments } = useSegments();
    if (recentlyUsedSegmentIds.length === 0 || !setSegments || !allSegments) {
        return null;
    }

    const segmentObjects = recentlyUsedSegmentIds
        .map((id) => allSegments.find((segment) => segment.id === id))
        .filter((segment) => segment !== undefined) as ISegment[];

    const nonSelectedRecentSegments = segmentObjects.filter(
        (segment) => !segments.some((selected) => selected.id === segment.id),
    );

    if (nonSelectedRecentSegments.length === 0) {
        return null;
    }

    return (
        <StyledContainer>
            <StyledHeader>Recently used segments</StyledHeader>
            <StyledSegmentsContainer>
                {nonSelectedRecentSegments.map((segment) => (
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
