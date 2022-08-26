import FormTemplate from 'component/common/FormTemplate/FormTemplate';
import { useNavigate } from 'react-router-dom';
import FeatureForm from '../FeatureForm/FeatureForm';
import useFeatureForm from '../hooks/useFeatureForm';
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
        impressionData,
        setImpressionData,
        clearErrors,
        errors,
    } = useFeatureForm(
        feature?.name,
        feature?.type,
        feature?.project,
        feature?.description,
        feature?.impressionData
    );

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
            await patchFeatureToggle(project, featureId, patch);
            navigate(`/projects/${project}/features/${name}`);
            setToastData({
                title: 'Toggle updated successfully',
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
            title="Edit Feature toggle"
            description="Feature toggles support different use cases, each with their own specific needs such as simple static routing or more complex routing.
            The feature toggle is disabled when created and you decide when to enable"
            documentationLink="https://docs.getunleash.io/advanced/feature_toggle_types"
            documentationLinkLabel="Feature toggle types documentation"
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
                impressionData={impressionData}
                setImpressionData={setImpressionData}
                mode="Edit"
                clearErrors={clearErrors}
            >
                <UpdateButton permission={UPDATE_FEATURE} projectId={project} />
            </FeatureForm>
        </FormTemplate>
    );
};

export default EditFeature;
