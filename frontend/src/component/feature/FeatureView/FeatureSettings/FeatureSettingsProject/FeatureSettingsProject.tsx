import { useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import AccessContext from 'contexts/AccessContext';
import useFeatureApi from 'hooks/api/actions/useFeatureApi/useFeatureApi';
import { useFeature } from 'hooks/api/getters/useFeature/useFeature';
import useToast from 'hooks/useToast';
import { MOVE_FEATURE_TOGGLE } from 'component/providers/AccessProvider/permissions';
import { ConditionallyRender } from 'component/common/ConditionallyRender/ConditionallyRender';
import PermissionButton from 'component/common/PermissionButton/PermissionButton';
import FeatureProjectSelect from './FeatureProjectSelect/FeatureProjectSelect';
import FeatureSettingsProjectConfirm from './FeatureSettingsProjectConfirm/FeatureSettingsProjectConfirm';
import { IPermission } from 'interfaces/user';
import { useAuthPermissions } from 'hooks/api/getters/useAuth/useAuthPermissions';
import { formatUnknownError } from 'utils/formatUnknownError';
import { useRequiredPathParam } from 'hooks/useRequiredPathParam';

const FeatureSettingsProject = () => {
    const { hasAccess } = useContext(AccessContext);
    const projectId = useRequiredPathParam('projectId');
    const featureId = useRequiredPathParam('featureId');
    const { feature, refetchFeature } = useFeature(projectId, featureId);
    const [project, setProject] = useState(feature.project);
    const [dirty, setDirty] = useState(false);
    const [showConfirmDialog, setShowConfirmDialog] = useState(false);
    const editable = hasAccess(MOVE_FEATURE_TOGGLE, projectId);
    const { permissions = [] } = useAuthPermissions();
    const { changeFeatureProject } = useFeatureApi();
    const { setToastData, setToastApiError } = useToast();
    const navigate = useNavigate();

    useEffect(() => {
        if (project !== feature.project) {
            setDirty(true);
            return;
        }
        setDirty(false);
        /* eslint-disable-next-line react-hooks/exhaustive-deps */
    }, [project]);

    useEffect(() => {
        const movableTargets = createMoveTargets();

        if (!movableTargets[project]) {
            setDirty(false);
            setProject(projectId);
        }
        /* eslint-disable-next-line */
    }, [permissions.length]);

    const updateProject = async () => {
        const newProject = project;
        try {
            await changeFeatureProject(projectId, featureId, newProject);
            refetchFeature();
            setToastData({
                title: 'Updated project',
                confetti: true,
                type: 'success',
                text: 'Successfully updated toggle project.',
            });
            setDirty(false);
            setShowConfirmDialog(false);
            navigate(`/projects/${newProject}/features/${featureId}/settings`, {
                replace: true,
            });
        } catch (error: unknown) {
            setToastApiError(formatUnknownError(error));
        }
    };

    const createMoveTargets = () => {
        return permissions.reduce(
            (acc: { [key: string]: boolean }, p: IPermission) => {
                if (p.project && p.permission === MOVE_FEATURE_TOGGLE) {
                    acc[p.project] = true;
                }
                return acc;
            },
            {}
        );
    };

    const filterProjects = () => {
        const validTargets = createMoveTargets();

        return (project: string) => {
            if (validTargets[project]) {
                return project;
            }
        };
    };
    return (
        <>
            <FeatureProjectSelect
                value={project}
                onChange={setProject}
                label="Project"
                enabled={editable}
                filter={filterProjects()}
            />
            <ConditionallyRender
                condition={dirty}
                show={
                    <PermissionButton
                        permission={MOVE_FEATURE_TOGGLE}
                        onClick={() => setShowConfirmDialog(true)}
                        projectId={projectId}
                    >
                        Save changes
                    </PermissionButton>
                }
            />
            <FeatureSettingsProjectConfirm
                projectId={project}
                open={showConfirmDialog}
                feature={feature}
                onClose={() => setShowConfirmDialog(false)}
                onClick={updateProject}
            />
        </>
    );
};

export default FeatureSettingsProject;
