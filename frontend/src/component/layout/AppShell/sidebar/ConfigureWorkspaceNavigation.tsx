import type { FC } from 'react';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { SidebarButton } from './SidebarButton.tsx';
import { SidebarSection } from './SidebarSection.tsx';

export const ConfigureWorkspaceNavigation: FC<{ onBack: () => void }> = ({
    onBack,
}) => (
    <>
        <SidebarButton
            icon={<ArrowBackIcon />}
            label='Back to app'
            onClick={onBack}
        />
        <SidebarSection title='Configure workspace' />
    </>
);
