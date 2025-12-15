import { useRequiredPathParam } from 'hooks/useRequiredPathParam';
import { usePageTitle } from 'hooks/usePageTitle';
import { Route, Routes, useNavigate } from 'react-router-dom';
import { SidebarModal } from 'component/common/SidebarModal/SidebarModal';
import { GO_BACK } from 'constants/navigate';
import { useProjectOverviewNameOrId } from 'hooks/api/getters/useProjectOverview/useProjectOverview';
import ContextList from 'component/context/ContextList/ContextList/ContextList';
import { CreateUnleashContext } from 'component/context/CreateUnleashContext/CreateUnleashContext';
import { EditContext } from 'component/context/EditContext/EditContext';

export const ProjectContextFields = () => {
    const projectId = useRequiredPathParam('projectId');
    const projectName = useProjectOverviewNameOrId(projectId);
    const navigate = useNavigate();

    usePageTitle(`Project context fields – ${projectName}`);

    return (
        <Routes>
            <Route
                path='create'
                element={
                    <SidebarModal
                        open
                        onClose={() => navigate(GO_BACK)}
                        label='Create segment'
                    >
                        <CreateUnleashContext
                            modal
                            onSubmit={() => navigate(GO_BACK)}
                            onCancel={() => navigate(GO_BACK)}
                        />
                    </SidebarModal>
                }
            />
            <Route
                path='edit/:name'
                element={
                    <SidebarModal
                        open
                        onClose={() => navigate(GO_BACK)}
                        label='Edit context field'
                    >
                        <EditContext modal />
                    </SidebarModal>
                }
            />
            {/* change this to be the context table */}
            <Route path='*' element={<ContextList />} />
        </Routes>
    );
};
