import { styled } from '@mui/material';
import { Chip } from '@mui/material';
import type { ITag } from 'interfaces/tags';
import type { ReactElement } from 'react';

const StyledChip = styled(Chip)<{ $color?: string }>(({ theme, $color }) => ({
    borderRadius: theme.spacing(2),
    border: `1px solid ${theme.palette.divider}`,
    backgroundColor: theme.palette.background.paper,
    color: theme.palette.text.primary,
    height: '26px',
    '& .MuiChip-label': {
        display: 'flex',
        alignItems: 'center',
        gap: theme.spacing(1),
    },
}));

const ColorDot = styled('div')<{ $color: string }>(({ theme, $color }) => ({
    width: theme.spacing(1.3),
    height: theme.spacing(1.3),
    borderRadius: '50%',
    backgroundColor: $color,
    border: `1px solid ${$color === '#FFFFFF' ? theme.palette.divider : $color}`,
    flexShrink: 0,
}));

interface ITagProps {
    tag: ITag;
    onDelete?: () => void;
    deleteIcon?: ReactElement;
}

export const Tag = ({ tag, onDelete, deleteIcon }: ITagProps) => {
    const label = `${tag.type}:${tag.value}`;
    const showColorDot = tag.color && tag.color !== '#FFFFFF';

    const labelContent = (
        <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {showColorDot && <ColorDot $color={tag.color!} />}
            <span>{label}</span>
        </span>
    ) as ReactElement;

    return (
        <StyledChip
            label={labelContent}
            onDelete={onDelete}
            deleteIcon={deleteIcon}
        />
    );
};
