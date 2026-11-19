import type { FC } from 'react';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { adminRoutes } from 'component/admin/adminRoutes';
import { SidebarButton } from './SidebarButton.tsx';
import { SidebarSection } from './SidebarSection.tsx';
import { createPageMatcher } from './createPageMatcher.ts';

// Matches every admin path regardless of plan: the filtered list depends on
// ui-config and instance status, so a deep link would show the app navigation
// until they load.
export const isAdminSettingsPage = createPageMatcher(
    adminRoutes.map((route) => route.path),
);

export const AdminSettingsNavigation: FC<{ onBack: () => void }> = ({
    onBack,
}) => (
    <>
        <SidebarButton
            icon={<ArrowBackIcon />}
            label='Back to app'
            onClick={onBack}
        />
        <SidebarSection title='Admin settings' />
    </>
);
