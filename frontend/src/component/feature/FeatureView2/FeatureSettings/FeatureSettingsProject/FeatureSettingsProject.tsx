import { useState, useEffect, useContext } from 'react';
import { useHistory, useParams } from 'react-router';
import AccessContext from '../../../../../contexts/AccessContext';
import useFeatureApi from '../../../../../hooks/api/actions/useFeatureApi/useFeatureApi';
import useFeature from '../../../../../hooks/api/getters/useFeature/useFeature';
import useUser from '../../../../../hooks/api/getters/useUser/useUser';
import useToast from '../../../../../hooks/useToast';
import { IFeatureViewParams } from '../../../../../interfaces/params';
import { projectFilterGenerator } from '../../../../../utils/project-filter-generator';
import {
    CREATE_FEATURE,
    UPDATE_FEATURE,
} from '../../../../providers/AccessProvider/permissions';
import ConditionallyRender from '../../../../common/ConditionallyRender';
import PermissionButton from '../../../../common/PermissionButton/PermissionButton';
import FeatureProjectSelect from './FeatureProjectSelect/FeatureProjectSelect';
import FeatureSettingsProjectConfirm from './FeatureSettingsProjectConfirm/FeatureSettingsProjectConfirm';

const FeatureSettingsProject = () => {
    const { hasAccess } = useContext(AccessContext);
    const { projectId, featureId } = useParams<IFeatureViewParams>();
    const { feature, refetch } = useFeature(projectId, featureId);
    const [project, setProject] = useState(feature.project);
    const [dirty, setDirty] = useState(false);
    const [showConfirmDialog, setShowConfirmDialog] = useState(false);
    const editable = hasAccess(UPDATE_FEATURE, projectId);
    const { permissions } = useUser();
    const { changeFeatureProject } = useFeatureApi();
    const { toast, setToastData } = useToast();
    const history = useHistory();

    useEffect(() => {
        if (project !== feature.project) {
            setDirty(true);
            return;
        }
        setDirty(false);
        /* eslint-disable-next-line react-hooks/exhaustive-deps */
    }, [project]);

    const updateProject = async () => {
        const newProject = project;
        try {
            await changeFeatureProject(projectId, featureId, newProject);
            refetch();
            setToastData({
                show: true,
                type: 'success',
                text: 'Successfully updated toggle project.',
            });
            setDirty(false);
            setShowConfirmDialog(false);
            history.replace(
                `/projects/${newProject}/features2/${featureId}/settings`
            );
        } catch (e) {
            setToastData({
                show: true,
                type: 'error',
                text: e.toString(),
            });
        }
    };

    return (
        <>
            <FeatureProjectSelect
                value={project}
                onChange={e => setProject(e.target.value)}
                label="Project"
                enabled={editable}
                filter={projectFilterGenerator({ permissions }, CREATE_FEATURE)}
            />
            <ConditionallyRender
                condition={dirty}
                show={
                    <PermissionButton
                        permission={UPDATE_FEATURE}
                        tooltip="Update feature"
                        onClick={() => setShowConfirmDialog(true)}
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
            {toast}
        </>
    );
};

export default FeatureSettingsProject;
