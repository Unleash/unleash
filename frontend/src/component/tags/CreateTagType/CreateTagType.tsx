import { useNavigate } from 'react-router-dom';
import useTagTypeForm from '../TagTypeForm/useTagTypeForm';
import TagTypeForm from '../TagTypeForm/TagTypeForm';
import { CreateButton } from 'component/common/CreateButton/CreateButton';
import FormTemplate from 'component/common/FormTemplate/FormTemplate';
import { UPDATE_TAG_TYPE } from 'component/providers/AccessProvider/permissions';
import useTagTypesApi from 'hooks/api/actions/useTagTypesApi/useTagTypesApi';
import useUiConfig from 'hooks/api/getters/useUiConfig/useUiConfig';
import useToast from 'hooks/useToast';
import { formatUnknownError } from 'utils/formatUnknownError';
import { GO_BACK } from 'constants/navigate';

const CreateTagType = () => {
    const { setToastData, setToastApiError } = useToast();
    const { uiConfig } = useUiConfig();
    const navigate = useNavigate();
    const {
        tagName,
        tagDesc,
        setTagName,
        setTagDesc,
        getTagPayload,
        validateNameUniqueness,
        errors,
        clearErrors,
    } = useTagTypeForm();
    const { createTag, loading } = useTagTypesApi();

    const handleSubmit = async (e: Event) => {
        e.preventDefault();
        clearErrors();
        const validName = await validateNameUniqueness();
        if (validName) {
            const payload = getTagPayload();
            try {
                await createTag(payload);
                navigate('/tag-types');
                setToastData({
                    title: 'Tag type created',
                    confetti: true,
                    type: 'success',
                });
            } catch (error: unknown) {
                setToastApiError(formatUnknownError(error));
            }
        }
    };

    const formatApiCode = () => {
        return `curl --location --request POST '${
            uiConfig.unleashUrl
        }/api/admin/tag-types' \\
--header 'Authorization: INSERT_API_KEY' \\
--header 'Content-Type: application/json' \\
--data-raw '${JSON.stringify(getTagPayload(), undefined, 2)}'`;
    };

    const handleCancel = () => {
        navigate(GO_BACK);
    };

    return (
        <FormTemplate
            loading={loading}
            title="Create tag type"
            description="Tag types allow you to group tags together in the management UI"
            documentationLink="https://docs.getunleash.io/advanced/tags"
            documentationLinkLabel="Tags documentation"
            formatApiCode={formatApiCode}
        >
            <TagTypeForm
                errors={errors}
                handleSubmit={handleSubmit}
                handleCancel={handleCancel}
                tagName={tagName}
                setTagName={setTagName}
                tagDesc={tagDesc}
                setTagDesc={setTagDesc}
                mode="Create"
                clearErrors={clearErrors}
                validateNameUniqueness={validateNameUniqueness}
            >
                <CreateButton name="type" permission={UPDATE_TAG_TYPE} />
            </TagTypeForm>
        </FormTemplate>
    );
};

export default CreateTagType;
