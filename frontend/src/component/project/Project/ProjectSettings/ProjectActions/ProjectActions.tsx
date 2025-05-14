import { PageContent } from 'component/common/PageContent/PageContent';
import useUiConfig from 'hooks/api/getters/useUiConfig/useUiConfig';
import { PageHeader } from 'component/common/PageHeader/PageHeader';
import { ADMIN } from '@server/types/permissions';
import { useRequiredPathParam } from 'hooks/useRequiredPathParam';
import { usePageTitle } from 'hooks/usePageTitle';
import { useProjectOverviewNameOrId } from 'hooks/api/getters/useProjectOverview/useProjectOverview';
import { PremiumFeature } from 'component/common/PremiumFeature/PremiumFeature';
import { PermissionGuard } from 'component/common/PermissionGuard/PermissionGuard';
import { ProjectActionsTable } from './ProjectActionsTable/ProjectActionsTable.tsx';
import ResponsiveButton from 'component/common/ResponsiveButton/ResponsiveButton';
import { useTheme } from '@mui/material';
import Add from '@mui/icons-material/Add';
import type { IActionSet } from 'interfaces/action';
import { useState } from 'react';

export const ProjectActions = () => {
    const projectId = useRequiredPathParam('projectId');
    const projectName = useProjectOverviewNameOrId(projectId);
    const { isEnterprise } = useUiConfig();
    const theme = useTheme();

    usePageTitle(`Project actions – ${projectName}`);

    const [selectedAction, setSelectedAction] = useState<IActionSet>();
    const [actionModalOpen, setActionModalOpen] = useState(false);

    const onNewAction = () => {
        setSelectedAction(undefined);
        setActionModalOpen(true);
    };

    if (!isEnterprise()) {
        return (
            <PageContent header={<PageHeader title='Actions' />}>
                <PremiumFeature feature='actions' />
            </PageContent>
        );
    }

    return (
        <PageContent
            header={
                <PageHeader
                    title='Actions'
                    actions={
                        <ResponsiveButton
                            onClick={onNewAction}
                            maxWidth={`${theme.breakpoints.values.sm}px`}
                            Icon={Add}
                            permission={ADMIN}
                        >
                            New action
                        </ResponsiveButton>
                    }
                />
            }
        >
            <PermissionGuard permissions={ADMIN}>
                <ProjectActionsTable
                    modalOpen={actionModalOpen}
                    setModalOpen={setActionModalOpen}
                    selectedAction={selectedAction}
                    setSelectedAction={setSelectedAction}
                />
            </PermissionGuard>
        </PageContent>
    );
};
