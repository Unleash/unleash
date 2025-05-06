import type React from 'react';
import type { ISegment } from 'interfaces/segment';
import AddIcon from '@mui/icons-material/Add';
import { Chip, styled, Tooltip } from '@mui/material';

interface IRecentlyUsedSegmentChipProps {
    segment: ISegment;
    setSegments: React.Dispatch<React.SetStateAction<ISegment[]>>;
}

const StyledChip = styled(Chip)(({ theme }) => ({
    background: 'transparent',
    height: 'auto',
    '.MuiChip-label': {
        fontSize: theme.typography.body2.fontSize,
        padding: theme.spacing(0.5, 1),
    },
    '&.MuiChip-outlined': {
        border: `1px dashed ${theme.palette.divider}`,
    },
    '& .MuiChip-icon': {
        color: theme.palette.neutral.main,
        marginLeft: theme.spacing(1),
    },
}));

export const RecentlyUsedSegmentChip = ({
    segment,
    setSegments,
}: IRecentlyUsedSegmentChipProps) => {
    const onAdd = () => {
        setSegments((prev) => {
            if (prev.some((s) => s.id === segment.id)) {
                return prev;
            }
            return [...prev, segment];
        });
    };

    return (
        <Tooltip title='Add segment' arrow>
            <StyledChip
                label={segment.name}
                icon={<AddIcon />}
                onClick={onAdd}
                variant='outlined'
                clickable
            />
        </Tooltip>
    );
};
