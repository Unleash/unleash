import type { FC } from 'react';
import { ButtonBase, styled } from '@mui/material';
import MoreHorizIcon from '@mui/icons-material/MoreHoriz';
import { SidebarItemIcon, sidebarItemStyles } from './SidebarItem.styles.ts';

const StyledButton = styled(ButtonBase)(({ theme }) =>
    sidebarItemStyles(theme),
);

export const SidebarMoreToggle: FC<{
    expanded: boolean;
    onToggle: () => void;
}> = ({ expanded, onToggle }) => (
    <StyledButton aria-expanded={expanded} onClick={onToggle}>
        <SidebarItemIcon>
            <MoreHorizIcon />
        </SidebarItemIcon>
        {expanded ? 'Less' : 'More'}
    </StyledButton>
);
