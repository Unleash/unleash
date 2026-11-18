import type { FC } from 'react';
import { ButtonBase, styled } from '@mui/material';
import MoreHorizIcon from '@mui/icons-material/MoreHoriz';
import {
    SidebarCaret,
    sidebarItemStyles,
    SUB_ITEM_INDENT,
} from './SidebarItem.styles.ts';
import { SidebarButton } from './SidebarButton.tsx';

const StyledNestedButton = styled(ButtonBase)(({ theme }) => ({
    ...sidebarItemStyles(theme),
    gap: theme.spacing(0.25),
    paddingLeft: theme.spacing(SUB_ITEM_INDENT),
    color: theme.palette.text.secondary,
}));

export const SidebarMoreToggle: FC<{
    expanded: boolean;
    onToggle: () => void;
    variant?: 'top-level' | 'nested';
}> = ({ expanded, onToggle, variant = 'top-level' }) => {
    const label = expanded ? 'Less' : 'More';

    if (variant === 'nested') {
        return (
            <StyledNestedButton aria-expanded={expanded} onClick={onToggle}>
                {label}
                <SidebarCaret expanded={expanded} />
            </StyledNestedButton>
        );
    }

    return (
        <SidebarButton
            icon={<MoreHorizIcon />}
            label={label}
            aria-expanded={expanded}
            onClick={onToggle}
        />
    );
};
