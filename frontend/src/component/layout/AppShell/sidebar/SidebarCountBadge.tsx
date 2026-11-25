import type { FC } from 'react';
import { styled } from '@mui/material';
import { ScreenReaderOnly } from 'component/common/ScreenReaderOnly/ScreenReaderOnly';

const StyledBadge = styled('span')(({ theme }) => ({
    flex: 'none',
    marginLeft: 'auto',
    padding: theme.spacing(0, 0.875),
    borderRadius: theme.spacing(1.25),
    fontSize: theme.typography.caption.fontSize,
    fontWeight: theme.typography.fontWeightMedium,
    lineHeight: '16px',
    backgroundColor: theme.palette.action.selected,
    color: theme.palette.text.primary,
}));

const MAX_COUNT = 99;

// The visible count is hidden from screen readers in favour of text that says
// what is counted.
export const SidebarCountBadge: FC<{ count?: number; description: string }> = ({
    count,
    description,
}) => {
    if (!count) {
        return null;
    }
    const shown = count > MAX_COUNT ? `${MAX_COUNT}+` : `${count}`;
    return (
        <StyledBadge>
            <span aria-hidden>{shown}</span>
            <ScreenReaderOnly as='span'>{` (${shown} ${description})`}</ScreenReaderOnly>
        </StyledBadge>
    );
};
