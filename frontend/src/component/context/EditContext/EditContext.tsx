import { useEffect } from 'react';
import { useHistory, useParams } from 'react-router-dom';
import { formatUnknownError } from 'utils/format-unknown-error';
import useContextsApi from '../../../hooks/api/actions/useContextsApi/useContextsApi';
import useContext from '../../../hooks/api/getters/useContext/useContext';
import useUiConfig from '../../../hooks/api/getters/useUiConfig/useUiConfig';
import useToast from '../../../hooks/useToast';
import FormTemplate from '../../common/FormTemplate/FormTemplate';
import PermissionButton from '../../common/PermissionButton/PermissionButton';
import { scrollToTop } from '../../common/util';
import { UPDATE_CONTEXT_FIELD } from '../../providers/AccessProvider/permissions';
import { ContextForm } from '../ContextForm/ContextForm';
import { useContextForm } from '../hooks/useContextForm';

export const EditContext = () => {
    useEffect(() => {
        scrollToTop();
    }, []);

    const { uiConfig } = useUiConfig();
    const { setToastData, setToastApiError } = useToast();
    const { name } = useParams<{ name: string }>();
    const { context, refetch } = useContext(name);
    const { updateContext, loading } = useContextsApi();
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
            history.push('/context');
            setToastData({
                title: 'Context information updated',
                type: 'success',
            });
        } catch (e: unknown) {
            setToastApiError(formatUnknownError(e));
        }
    };

    const onCancel = () => {
        history.goBack();
    };

    return (
        <FormTemplate
            loading={loading}
            title="Edit context"
            description="Context fields are a basic building block used in Unleash to control roll-out. 
            They can be used together with strategy constraints as part of the activation strategy evaluation."
            documentationLink="https://docs.getunleash.io/how-to/how-to-define-custom-context-fields"
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
                <PermissionButton
                    permission={UPDATE_CONTEXT_FIELD}
                    type="submit"
                >
                    Edit context
                </PermissionButton>
            </ContextForm>
        </FormTemplate>
    );
};
