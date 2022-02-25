import { useHistory } from 'react-router-dom';
import useUiConfig from '../../../hooks/api/getters/useUiConfig/useUiConfig';
import useToast from '../../../hooks/useToast';
import FormTemplate from '../../common/FormTemplate/FormTemplate';
import useContextForm from '../hooks/useContextForm';
import ContextForm from '../ContextForm/ContextForm';
import PermissionButton from '../../common/PermissionButton/PermissionButton';
import { CREATE_CONTEXT_FIELD } from '../../providers/AccessProvider/permissions';
import useContextsApi from '../../../hooks/api/actions/useContextsApi/useContextsApi';
import useUnleashContext from '../../../hooks/api/getters/useUnleashContext/useUnleashContext';
import { formatUnknownError } from '../../../utils/format-unknown-error';

const CreateContext = () => {
    const { setToastData, setToastApiError } = useToast();
    const { uiConfig } = useUiConfig();
    const history = useHistory();
    const {
        contextName,
        contextDesc,
        legalValues,
        stickiness,
        setContextName,
        setContextDesc,
        setLegalValues,
        setStickiness,
        getContextPayload,
        validateNameUniqueness,
        validateName,
        clearErrors,
        setErrors,
        errors,
    } = useContextForm();
    const { createContext, loading } = useContextsApi();
    const { refetch } = useUnleashContext();

    const handleSubmit = async (e: Event) => {
        e.preventDefault();
        const validName = validateName();
        if (validName) {
            const payload = getContextPayload();
            try {
                await createContext(payload);
                refetch();
                history.push('/context');
                setToastData({
                    title: 'Context created',
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
        }/api/admin/context' \\
--header 'Authorization: INSERT_API_KEY' \\
--header 'Content-Type: application/json' \\
--data-raw '${JSON.stringify(getContextPayload(), undefined, 2)}'`;
    };

    const handleCancel = () => {
        history.goBack();
    };

    return (
        <FormTemplate
            loading={loading}
            title="Create context"
            description="Context fields are a basic building block used in Unleash to control roll-out.
            They can be used together with strategy constraints as part of the activation strategy evaluation."
            documentationLink="https://docs.getunleash.io/how-to/how-to-define-custom-context-fields"
            formatApiCode={formatApiCode}
        >
            <ContextForm
                errors={errors}
                handleSubmit={handleSubmit}
                handleCancel={handleCancel}
                contextName={contextName}
                setContextName={setContextName}
                contextDesc={contextDesc}
                setContextDesc={setContextDesc}
                legalValues={legalValues}
                setLegalValues={setLegalValues}
                stickiness={stickiness}
                setStickiness={setStickiness}
                mode="Create"
                validateNameUniqueness={validateNameUniqueness}
                setErrors={setErrors}
                clearErrors={clearErrors}
            >
                <PermissionButton
                    permission={CREATE_CONTEXT_FIELD}
                    type="submit"
                >
                    Create context
                </PermissionButton>
            </ContextForm>
        </FormTemplate>
    );
};

export default CreateContext;
