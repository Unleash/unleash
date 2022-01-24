import FormTemplate from '../../../common/FormTemplate/FormTemplate';
import { useHistory, useParams } from 'react-router-dom';
import FeatureForm from '../FeatureForm/FeatureForm';
import useFeatureForm from '../hooks/useFeatureForm';
import useUiConfig from '../../../../hooks/api/getters/useUiConfig/useUiConfig';
import useToast from '../../../../hooks/useToast';
import useFeatureApi from '../../../../hooks/api/actions/useFeatureApi/useFeatureApi';
import useFeature from '../../../../hooks/api/getters/useFeature/useFeature';
import { IFeatureViewParams } from '../../../../interfaces/params';
import * as jsonpatch from 'fast-json-patch';
import PermissionButton from '../../../common/PermissionButton/PermissionButton';
import { UPDATE_FEATURE } from '../../../providers/AccessProvider/permissions';

const EditFeature = () => {
    /* @ts-ignore */
    const { setToastData, setToastApiError } = useToast();
    const { uiConfig } = useUiConfig();
    const history = useHistory();
    const { projectId, featureId } = useParams<IFeatureViewParams>();
    const { patchFeatureToggle, loading } = useFeatureApi();
    const { feature } = useFeature(projectId, featureId);

    const {
        type,
        setType,
        name,
        setName,
        project,
        setProject,
        description,
        setDescription,
        getTogglePayload,
        clearErrors,
        errors,
    } = useFeatureForm(
        feature?.name,
        feature?.type,
        feature?.project,
        feature?.description
    );

    const createPatch = () => {
        const comparison = { ...feature, type, description };
        const patch = jsonpatch.compare(feature, comparison);
        return patch;
    };

    const handleSubmit = async (e: Event) => {
        e.preventDefault();
        clearErrors();
        const patch = createPatch();
        try {
            await patchFeatureToggle(project, featureId, patch);
            history.push(`/projects/${project}/features2/${name}`);
            setToastData({
                title: 'Toggle updated successfully',
                text: 'Now you can start using your toggle.',
                type: 'success',
            });
        } catch (e: any) {
            setToastApiError(e.toString());
        }
    };

    const formatApiCode = () => {
        return `curl --location --request PATCH '${
            uiConfig.unleashUrl
        }/api/admin/projects/${projectId}/features/${featureId}' \\
    --header 'Authorization: INSERT_API_KEY' \\
    --header 'Content-Type: application/json' \\
    --data-raw '${JSON.stringify(getTogglePayload(), undefined, 2)}'`;
    };

    const handleCancel = () => {
        history.goBack();
    };

    return (
        <FormTemplate
            loading={loading}
            title="Create Feature toggle"
            description="Feature toggles support different use cases, each with their own specific needs such as simple static routing or more complex routing.
            The feature toggle is disabled when created and you decide when to enable"
            documentationLink="https://docs.getunleash.io/"
            formatApiCode={formatApiCode}
        >
            <FeatureForm
                type={type}
                name={name}
                project={project}
                description={description}
                setType={setType}
                setName={setName}
                setProject={setProject}
                setDescription={setDescription}
                errors={errors}
                handleSubmit={handleSubmit}
                handleCancel={handleCancel}
                mode="Edit"
                clearErrors={clearErrors}
            >
                <PermissionButton
                    onClick={handleSubmit}
                    permission={UPDATE_FEATURE}
                    projectId={project}
                    type="submit"
                >
                    Edit toggle
                </PermissionButton>
            </FeatureForm>
        </FormTemplate>
    );
};

export default EditFeature;
