import { useContext, useState, useMemo } from 'react';
import { useNavigate } from 'react-router';
import AccessContext from 'contexts/AccessContext';
import useFeatureApi from 'hooks/api/actions/useFeatureApi/useFeatureApi';
import { useFeature } from 'hooks/api/getters/useFeature/useFeature';
import useToast from 'hooks/useToast';
import { MOVE_FEATURE_TOGGLE } from 'component/providers/AccessProvider/permissions';
import PermissionButton from 'component/common/PermissionButton/PermissionButton';
import FeatureProjectSelect from './FeatureProjectSelect/FeatureProjectSelect';
import FeatureSettingsProjectConfirm from './FeatureSettingsProjectConfirm/FeatureSettingsProjectConfirm';
import { formatUnknownError } from 'utils/formatUnknownError';
import { useRequiredPathParam } from 'hooks/useRequiredPathParam';
import useProjects from 'hooks/api/getters/useProjects/useProjects';

const FeatureSettingsProject = () => {
    const { hasAccess } = useContext(AccessContext);
    const projectId = useRequiredPathParam('projectId');
    const featureId = useRequiredPathParam('featureId');
    const { feature, refetchFeature } = useFeature(projectId, featureId);
    const [showConfirmDialog, setShowConfirmDialog] = useState(false);
    const { changeFeatureProject } = useFeatureApi();
    const { setToastData, setToastApiError } = useToast();
    const [project, setProject] = useState(projectId);
    const { projects } = useProjects();
    const navigate = useNavigate();

    const onConfirm = async () => {
        try {
            if (project) {
                await changeFeatureProject(projectId, featureId, project);
                refetchFeature();
                setToastData({ title: 'Project changed', type: 'success' });
                setShowConfirmDialog(false);
                navigate(
                    `/projects/${project}/features/${featureId}/settings`,
                    { replace: true }
                );
            }
        } catch (error: unknown) {
            setToastApiError(formatUnknownError(error));
        }
    };

    const targetProjectIds = useMemo(() => {
        return projects
            .map(project => project.id)
            .filter(projectId => hasAccess(MOVE_FEATURE_TOGGLE, projectId));
    }, [projects, hasAccess]);

    if (targetProjectIds.length === 0) {
        return null;
    }

    return (
        <>
            <FeatureProjectSelect
                value={project}
                onChange={setProject}
                label="Project"
                filter={projectId => targetProjectIds.includes(projectId)}
                enabled
            />
            <PermissionButton
                permission={MOVE_FEATURE_TOGGLE}
                onClick={() => setShowConfirmDialog(true)}
                disabled={project === projectId}
                projectId={projectId}
            >
                Save
            </PermissionButton>
            <FeatureSettingsProjectConfirm
                projectId={project}
                open={showConfirmDialog}
                feature={feature}
                onClose={() => setShowConfirmDialog(false)}
                onClick={onConfirm}
            />
        </>
    );
};

export default FeatureSettingsProject;
