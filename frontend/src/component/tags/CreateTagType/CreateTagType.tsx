import { useNavigate } from 'react-router-dom';
import useTagTypeForm from '../TagTypeForm/useTagTypeForm.ts';
import TagTypeForm from '../TagTypeForm/TagTypeForm.tsx';
import { CreateButton } from 'component/common/CreateButton/CreateButton';
import FormTemplate from 'component/common/FormTemplate/FormTemplate';
import { CREATE_TAG_TYPE } from 'component/providers/AccessProvider/permissions';
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
        color,
        setTagName,
        setTagDesc,
        setColor,
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
                    text: 'Tag type created',
                    type: 'success',
                });
            } catch (error: unknown) {
                setToastApiError(formatUnknownError(error));
            }
        }
    };

    const formatApiCode = () => {
        return `curl --location --request POST '${uiConfig.unleashUrl}/api/admin/tag-types' \\
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
            title='Create tag type'
            description='Tag types allow you to group tags together in the management UI'
            documentationLink='https://docs.getunleash.io/concepts/feature-flags#tags'
            documentationLinkLabel='Tags documentation'
            formatApiCode={formatApiCode}
        >
            <TagTypeForm
                errors={errors}
                handleSubmit={handleSubmit}
                handleCancel={handleCancel}
                tagName={tagName}
                tagDesc={tagDesc}
                color={color}
                setTagName={setTagName}
                setTagDesc={setTagDesc}
                setColor={setColor}
                mode='Create'
                clearErrors={clearErrors}
                validateNameUniqueness={validateNameUniqueness}
            >
                <CreateButton name='type' permission={CREATE_TAG_TYPE} />
            </TagTypeForm>
        </FormTemplate>
    );
};

export default CreateTagType;
