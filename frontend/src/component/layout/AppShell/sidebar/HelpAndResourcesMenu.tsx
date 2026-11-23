import type { FC } from 'react';
import HelpOutlineOutlinedIcon from '@mui/icons-material/HelpOutlineOutlined';
import { HelpResources } from 'component/menu/Header/HelpResources/HelpResources';
import { SidebarMenuButton } from './SidebarMenuButton.tsx';

export const HelpAndResourcesMenu: FC<{ onSearchDocs?: () => void }> = ({
    onSearchDocs,
}) => (
    <HelpResources
        variant='sidebar'
        onSearchDocs={onSearchDocs}
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
