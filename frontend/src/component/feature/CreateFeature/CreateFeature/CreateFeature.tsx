import FormTemplate from '../../../common/FormTemplate/FormTemplate';
import { useHistory } from 'react-router-dom';
import FeatureForm from '../FeatureForm/FeatureForm';
import useFeatureForm from '../hooks/useFeatureForm';
import useUiConfig from '../../../../hooks/api/getters/useUiConfig/useUiConfig';
import useToast from '../../../../hooks/useToast';
import useFeatureApi from '../../../../hooks/api/actions/useFeatureApi/useFeatureApi';
import { CREATE_FEATURE } from '../../../providers/AccessProvider/permissions';
import PermissionButton from '../../../common/PermissionButton/PermissionButton';
import { CF_CREATE_BTN_ID } from '../../../../testIds';

const CreateFeature = () => {
    /* @ts-ignore */
    const { setToastData, setToastApiError } = useToast();
    const { uiConfig } = useUiConfig();
    const history = useHistory();

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
        validateName,
        clearErrors,
        errors,
    } = useFeatureForm();

    const { createFeatureToggle, loading } = useFeatureApi();

    const handleSubmit = async (e: Event) => {
        e.preventDefault();
        clearErrors();
        await validateName(name);
        const payload = getTogglePayload();
        try {
            await createFeatureToggle(project, payload);
            history.push(`/projects/${project}/features2/${name}`);
            setToastData({
                title: 'Toggle created successfully',
                text: 'Now you can start using your toggle.',
                confetti: true,
                type: 'success',
            });
        } catch (e: any) {
            setToastApiError(e.toString());
        }
    };

    const formatApiCode = () => {
        return `curl --location --request POST '${
            uiConfig.unleashUrl
        }/api/admin/projects/${project}/features' \\
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
                mode="Create"
                clearErrors={clearErrors}
            >
                <PermissionButton
                    onClick={handleSubmit}
                    permission={CREATE_FEATURE}
                    projectId={project}
                    type="submit"
                    data-test={CF_CREATE_BTN_ID}
                >
                    Create toggle
                </PermissionButton>
            </FeatureForm>
        </FormTemplate>
    );
};

export default CreateFeature;
