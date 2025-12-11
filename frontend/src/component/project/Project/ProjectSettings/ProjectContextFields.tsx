import { useRequiredPathParam } from 'hooks/useRequiredPathParam';
import { usePageTitle } from 'hooks/usePageTitle';
import { Route, Routes, useNavigate } from 'react-router-dom';
import { CreateSegment } from 'component/segments/CreateSegment/CreateSegment';
import { EditSegment } from 'component/segments/EditSegment/EditSegment';
import { SidebarModal } from 'component/common/SidebarModal/SidebarModal';
import { GO_BACK } from 'constants/navigate';
import { useProjectOverviewNameOrId } from 'hooks/api/getters/useProjectOverview/useProjectOverview';
import ContextList from 'component/context/ContextList/ContextList/ContextList';

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
                        <CreateSegment modal />
                    </SidebarModal>
                }
            />
            <Route
                path='edit/:segmentId'
                element={
                    <SidebarModal
                        open
                        onClose={() => navigate(GO_BACK)}
                        label='Edit segment'
                    >
                        <EditSegment modal />
                    </SidebarModal>
                }
            />
            {/* change this to be the context table */}
            <Route path='*' element={<ContextList />} />
        </Routes>
    );
};
