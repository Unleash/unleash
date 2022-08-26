import { useNavigate } from 'react-router-dom';
import { UPDATE_TAG_TYPE } from 'component/providers/AccessProvider/permissions';
import useTagTypeForm from '../TagTypeForm/useTagTypeForm';
import TagForm from '../TagTypeForm/TagTypeForm';
import { UpdateButton } from 'component/common/UpdateButton/UpdateButton';
import useTagTypesApi from 'hooks/api/actions/useTagTypesApi/useTagTypesApi';
import useTagType from 'hooks/api/getters/useTagType/useTagType';
import useUiConfig from 'hooks/api/getters/useUiConfig/useUiConfig';
import useToast from 'hooks/useToast';
import FormTemplate from 'component/common/FormTemplate/FormTemplate';
import { formatUnknownError } from 'utils/formatUnknownError';
import { useRequiredPathParam } from 'hooks/useRequiredPathParam';
import { GO_BACK } from 'constants/navigate';

const EditTagType = () => {
    const { setToastData, setToastApiError } = useToast();
    const { uiConfig } = useUiConfig();
    const navigate = useNavigate();
    const name = useRequiredPathParam('name');
    const { tagType } = useTagType(name);
    const {
        tagName,
        tagDesc,
        setTagName,
        setTagDesc,
        getTagPayload,
        errors,
        clearErrors,
    } = useTagTypeForm(tagType?.name, tagType?.description);
    const { updateTagType, loading } = useTagTypesApi();

    const handleSubmit = async (e: Event) => {
        e.preventDefault();
        clearErrors();
        const payload = getTagPayload();
        try {
            await updateTagType(tagName, payload);
            navigate('/tag-types');
            setToastData({
                title: 'Tag type updated',
                type: 'success',
            });
        } catch (error: unknown) {
            setToastApiError(formatUnknownError(error));
        }
    };

    const formatApiCode = () => {
        return `curl --location --request PUT '${
            uiConfig.unleashUrl
        }/api/admin/tag-types/${name}' \\
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
            title="Edit tag type"
            description="Tag types allow you to group tags together in the management UI"
            documentationLink="https://docs.getunleash.io/"
            documentationLinkLabel="Tags documentation"
            formatApiCode={formatApiCode}
        >
            <TagForm
                errors={errors}
                handleSubmit={handleSubmit}
                handleCancel={handleCancel}
                tagName={tagName}
                setTagName={setTagName}
                tagDesc={tagDesc}
                setTagDesc={setTagDesc}
                mode="Edit"
                clearErrors={clearErrors}
            >
                <UpdateButton permission={UPDATE_TAG_TYPE} />
            </TagForm>
        </FormTemplate>
    );
};

export default EditTagType;
