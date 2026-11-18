import type { FC } from 'react';
import SettingsOutlinedIcon from '@mui/icons-material/SettingsOutlined';
import { SidebarMenuButton } from './SidebarMenuButton.tsx';

export const SettingsMenu: FC = () => (
    <SidebarMenuButton
        icon={<SettingsOutlinedIcon />}
        label='Settings'
        open={false}
        onClick={() => {}}
    />
);
