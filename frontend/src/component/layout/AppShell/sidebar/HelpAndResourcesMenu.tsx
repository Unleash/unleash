import type { FC } from 'react';
import HelpOutlineOutlinedIcon from '@mui/icons-material/HelpOutlineOutlined';
import { HelpResources } from 'component/menu/Header/HelpResources/HelpResources';
import { SidebarMenuButton } from './SidebarMenuButton.tsx';

export const HelpAndResourcesMenu: FC = () => (
    <HelpResources
        variant='sidebar'
        renderTrigger={({ ref, open, onClick }) => (
            <SidebarMenuButton
                ref={ref}
                icon={<HelpOutlineOutlinedIcon />}
                label='Help & resources'
                open={open}
                onClick={onClick}
            />
        )}
    />
);
