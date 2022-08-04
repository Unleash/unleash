import FormTemplate from 'component/common/FormTemplate/FormTemplate';
import { UpdateButton } from 'component/common/UpdateButton/UpdateButton';
import { UPDATE_CONTEXT_FIELD } from 'component/providers/AccessProvider/permissions';
import useContextsApi from 'hooks/api/actions/useContextsApi/useContextsApi';
import useContext from 'hooks/api/getters/useContext/useContext';
import useUiConfig from 'hooks/api/getters/useUiConfig/useUiConfig';
import useToast from 'hooks/useToast';
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { scrollToTop } from 'component/common/util';
import { formatUnknownError } from 'utils/formatUnknownError';
import { ContextForm } from '../ContextForm/ContextForm';
import { useContextForm } from '../hooks/useContextForm';
import { useRequiredPathParam } from 'hooks/useRequiredPathParam';
import { GO_BACK } from 'constants/navigate';

export const EditContext = () => {
    useEffect(() => {
        scrollToTop();
    }, []);

    const { uiConfig } = useUiConfig();
    const { setToastData, setToastApiError } = useToast();
    const name = useRequiredPathParam('name');
    const { context, refetch } = useContext(name);
    const { updateContext, loading } = useContextsApi();
    const navigate = useNavigate();
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
        clearErrors,
        setErrors,
        errors,
    } = useContextForm(
        context?.name,
        context?.description,
        context?.legalValues,
        context?.stickiness
    );

    const formatApiCode = () => {
        return `curl --location --request PUT '${
            uiConfig.unleashUrl
        }/api/admin/context/${name}' \\
--header 'Authorization: INSERT_API_KEY' \\
--header 'Content-Type: application/json' \\
--data-raw '${JSON.stringify(getContextPayload(), undefined, 2)}'`;
    };

    const handleSubmit = async (e: Event) => {
        e.preventDefault();
        const payload = getContextPayload();

        try {
            await updateContext(payload);
            refetch();
            navigate('/context');
            setToastData({
                title: 'Context information updated',
                type: 'success',
            });
        } catch (e: unknown) {
            setToastApiError(formatUnknownError(e));
        }
    };

    const onCancel = () => {
        navigate(GO_BACK);
    };

    return (
        <FormTemplate
            loading={loading}
            title="Edit context"
            description="Context fields are a basic building block used in Unleash to control roll-out.
            They can be used together with strategy constraints as part of the activation strategy evaluation."
            documentationLink="https://docs.getunleash.io/user_guide/unleash_context#custom-context-fields"
            documentationLinkLabel="Context fields documentation"
            formatApiCode={formatApiCode}
        >
            <ContextForm
                errors={errors}
                handleSubmit={handleSubmit}
                onCancel={onCancel}
                contextName={contextName}
                setContextName={setContextName}
                contextDesc={contextDesc}
                setContextDesc={setContextDesc}
                legalValues={legalValues}
                setLegalValues={setLegalValues}
                stickiness={stickiness}
                setStickiness={setStickiness}
                mode="Edit"
                setErrors={setErrors}
                clearErrors={clearErrors}
            >
                <UpdateButton permission={UPDATE_CONTEXT_FIELD} />
            </ContextForm>
        </FormTemplate>
    );
};
