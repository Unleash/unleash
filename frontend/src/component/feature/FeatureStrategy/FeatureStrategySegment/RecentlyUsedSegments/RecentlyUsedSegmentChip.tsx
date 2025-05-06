import type React from 'react';
import type { ISegment } from 'interfaces/segment';
import Add from '@mui/icons-material/Add';
import { styled, type Theme, Tooltip } from '@mui/material';

interface IRecentlyUsedSegmentChipProps {
    segment: ISegment;
    setSegments: React.Dispatch<React.SetStateAction<ISegment[]>>;
}

const StyledChip = styled('button')(({ theme }) => ({
    all: 'unset',
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(0.5),
    paddingInlineStart: theme.spacing(2),
    paddingInlineEnd: theme.spacing(1),
    paddingBlockStart: theme.spacing(0.5),
    paddingBlockEnd: theme.spacing(0.5),
    borderRadius: '100rem',
    color: theme.palette.text.primary,
    border: `1px dashed ${theme.palette.divider}`,
    background: 'transparent',
    cursor: 'pointer',
    boxSizing: 'border-box',
    '&:hover': {
        backgroundColor: 'rgba(0, 0, 0, 0.05)',
    },
    '&:focus': {
        outline: `1px solid ${theme.palette.primary.main}`,
        outlineOffset: '2px',
    },
}));

const StyledSegmentName = styled('span')(({ theme }) => ({
    marginLeft: theme.spacing(0.5),
    fontSize: theme.typography.body2.fontSize,
}));

const styledIcon = (theme: Theme) => ({
    fontSize: theme.fontSizes.bodySize,
    color: theme.palette.neutral.main,
});

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
            <StyledChip type='button' onClick={onAdd}>
                <Add titleAccess='Add' sx={styledIcon} />
                <StyledSegmentName>{segment.name}</StyledSegmentName>
            </StyledChip>
        </Tooltip>
    );
};
