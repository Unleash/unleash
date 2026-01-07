import FormTemplate from 'component/common/FormTemplate/FormTemplate';
import { useNavigate } from 'react-router-dom';
import EditFeatureForm from '../FeatureForm/EditFeatureForm.tsx';
import useFeatureForm from '../hooks/useFeatureForm.ts';
import * as jsonpatch from 'fast-json-patch';
import { UpdateButton } from 'component/common/UpdateButton/UpdateButton';
import { UPDATE_FEATURE } from 'component/providers/AccessProvider/permissions';
import useFeatureApi from 'hooks/api/actions/useFeatureApi/useFeatureApi';
import { useFeature } from 'hooks/api/getters/useFeature/useFeature';
import useUiConfig from 'hooks/api/getters/useUiConfig/useUiConfig';
import useToast from 'hooks/useToast';
import { formatUnknownError } from 'utils/formatUnknownError';
import { useRequiredPathParam } from 'hooks/useRequiredPathParam';
import { GO_BACK } from 'constants/navigate';

const EditFeature = () => {
    const projectId = useRequiredPathParam('projectId');
    const featureId = useRequiredPathParam('featureId');
    const { setToastData, setToastApiError } = useToast();
    const { uiConfig } = useUiConfig();
    const navigate = useNavigate();
    const { patchFeatureToggle: patchFeatureFlag, loading } = useFeatureApi();
    const { feature } = useFeature(projectId, featureId);

    const {
        type,
        setType,
        name,
        project,
        description,
        setDescription,
        impressionData,
        setImpressionData,
        clearErrors,
    } = useFeatureForm({
        name: feature?.name,
        type: feature?.type,
        project: feature?.project,
        description: feature?.description,
        impressionData: feature?.impressionData,
    });

    const createPatch = () => {
        const comparison = { ...feature, type, description, impressionData };
        const patch = jsonpatch.compare(feature, comparison);
        return patch;
    };

    const handleSubmit = async (e: Event) => {
        e.preventDefault();
        clearErrors();
        const patch = createPatch();
        try {
            await patchFeatureFlag(project, featureId, patch);
            navigate(`/projects/${project}/features/${name}`);
            setToastData({
                text: 'Flag updated',
                type: 'success',
            });
        } catch (error: unknown) {
            setToastApiError(formatUnknownError(error));
        }
    };

    const formatApiCode = () => {
        return `curl --location --request PATCH '${
            uiConfig.unleashUrl
        }/api/admin/projects/${projectId}/features/${featureId}' \\
    --header 'Authorization: INSERT_API_KEY' \\
    --header 'Content-Type: application/json' \\
    --data-raw '${JSON.stringify(createPatch(), undefined, 2)}'`;
    };

    const handleCancel = () => {
        navigate(GO_BACK);
    };

    return (
        <FormTemplate
            loading={loading}
            title='Edit Feature flag'
            description='Feature flags support different use cases, each with their own specific needs such as simple static routing or more complex routing.
            The feature flag is disabled when created and you decide when to enable'
            documentationLink='https://docs.getunleash.io/concepts/feature-flags#feature-flag-types'
            documentationLinkLabel='Feature flag types documentation'
            formatApiCode={formatApiCode}
        >
            <EditFeatureForm
                type={type}
                name={name}
                description={description}
                setType={setType}
                setDescription={setDescription}
                handleSubmit={handleSubmit}
                handleCancel={handleCancel}
                impressionData={impressionData}
                setImpressionData={setImpressionData}
            >
                <UpdateButton permission={UPDATE_FEATURE} projectId={project} />
            </EditFeatureForm>
        </FormTemplate>
    );
};

export default EditFeature;
