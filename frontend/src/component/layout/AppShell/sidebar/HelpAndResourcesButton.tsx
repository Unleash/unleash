import type { FC } from 'react';
import { ButtonBase, styled } from '@mui/material';
import HelpOutlineOutlinedIcon from '@mui/icons-material/HelpOutlineOutlined';
import { HelpResources } from 'component/menu/Header/HelpResources/HelpResources';
import { SidebarItemIcon, sidebarItemStyles } from './SidebarItem.styles.ts';

const StyledButton = styled(ButtonBase)(({ theme }) => ({
    ...sidebarItemStyles(theme),
    '&[aria-expanded="true"]': {
        backgroundColor: theme.palette.action.hover,
    },
}));

export const HelpAndResourcesButton: FC = () => (
    <HelpResources
        variant='sidebar'
        renderTrigger={({ ref, open, onClick }) => (
            <StyledButton
                ref={ref}
                onClick={onClick}
                aria-haspopup='menu'
                aria-expanded={open}
            >
                <SidebarItemIcon>
                    <HelpOutlineOutlinedIcon />
                </SidebarItemIcon>
                Help & resources
            </StyledButton>
        )}
    />
);
