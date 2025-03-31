import { styled } from '@mui/material';
import { Chip } from '@mui/material';
import type { TagSchema } from 'openapi';
import type { ReactElement } from 'react';
import { formatTag } from 'utils/format-tag';

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
        paddingRight: theme.spacing(1),
    },
    '& .MuiChip-deleteIcon': {
        marginLeft: theme.spacing(0.5),
        marginRight: theme.spacing(0.5),
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
    tag: TagSchema;
    onDelete?: () => void;
    deleteIcon?: ReactElement;
    maxLength?: number;
}

export const Tag = ({
    tag,
    onDelete,
    deleteIcon,
    maxLength = 30,
}: ITagProps) => {
    const fullLabel = formatTag(tag);
    const isOverflowing = fullLabel.length > maxLength;
    const showColorDot = tag.color && tag.color !== '#FFFFFF';

    let displayValue = tag.value;
    if (isOverflowing) {
        // Calculate how much of the value we can show
        const maxValueLength = Math.max(0, maxLength - tag.type.length - 1); // -1 for the colon
        displayValue = `${tag.value.substring(0, maxValueLength)}...`;
    }

    const labelContent = (
        <span
            style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                width: '100%',
            }}
        >
            {showColorDot && <ColorDot $color={tag.color!} />}
            <span
                style={{
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                }}
            >
                {`${tag.type}:${displayValue}`}
            </span>
        </span>
    ) as ReactElement;

    return (
        <StyledChip
            label={labelContent}
            onDelete={onDelete}
            deleteIcon={deleteIcon}
            title={isOverflowing ? fullLabel : undefined}
        />
    );
};
