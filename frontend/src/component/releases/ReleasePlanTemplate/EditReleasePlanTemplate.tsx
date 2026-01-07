import { usePageTitle } from 'hooks/usePageTitle';
import { useRequiredPathParam } from 'hooks/useRequiredPathParam';
import { useReleasePlanTemplate } from 'hooks/api/getters/useReleasePlanTemplates/useReleasePlanTemplate';
import { useTemplateForm } from '../hooks/useTemplateForm.ts';
import { TemplateForm } from './TemplateForm/TemplateForm.tsx';
import { Button, styled } from '@mui/material';
import { UpdateButton } from 'component/common/UpdateButton/UpdateButton';
import { RELEASE_PLAN_TEMPLATE_UPDATE } from '@server/types/permissions';
import { useNavigate } from 'react-router-dom';
import { formatUnknownError } from 'utils/formatUnknownError';
import useToast from 'hooks/useToast';
import useReleasePlanTemplatesApi from 'hooks/api/actions/useReleasePlanTemplatesApi/useReleasePlanTemplatesApi';
import useUiConfig from 'hooks/api/getters/useUiConfig/useUiConfig';
import { usePlausibleTracker } from 'hooks/usePlausibleTracker';

const StyledButtonContainer = styled('div')(() => ({
    marginTop: 'auto',
    display: 'flex',
    justifyContent: 'flex-end',
}));

const StyledCancelButton = styled(Button)(({ theme }) => ({
    marginLeft: theme.spacing(3),
}));

export const EditReleasePlanTemplate = () => {
    const { uiConfig, isEnterprise } = useUiConfig();
    const templateId = useRequiredPathParam('templateId');
    const { template, loading, error, refetch } =
        useReleasePlanTemplate(templateId);
    const { trackEvent } = usePlausibleTracker();
    usePageTitle(`Edit release template`);
    const navigate = useNavigate();
    const { setToastApiError, setToastData } = useToast();
    const { updateReleasePlanTemplate } = useReleasePlanTemplatesApi();
    const {
        name,
        setName,
        description,
        setDescription,
        errors,
        clearErrors,
        milestones,
        setMilestones,
        validate,
        getTemplatePayload,
    } = useTemplateForm(
        template.name,
        template.description,
        template.milestones,
    );

    const handleCancel = () => {
        navigate('/release-templates');
    };
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        clearErrors();
        const isValid = validate();
        if (isValid) {
            try {
                await updateReleasePlanTemplate(
                    templateId,
                    getTemplatePayload(),
                );
                await refetch();
                setToastData({
                    type: 'success',
                    text: 'Release template updated',
                });

                trackEvent('release-management', {
                    props: {
                        eventType: 'edit-template',
                        template: template.name,
                    },
                });

                navigate('/release-templates');
            } catch (error: unknown) {
                setToastApiError(formatUnknownError(error));
            }
        }
    };

    const formatApiCode = () => `curl --location --request PUT '${
        uiConfig.unleashUrl
    }/api/admin/release-plan-templates/${templateId}' \\
    --header 'Authorization: INSERT_API_KEY' \\
    --header 'Content-Type: application/json' \\
    --data-raw '${JSON.stringify(getTemplatePayload(), undefined, 2)}'`;

    if (!isEnterprise()) {
        return null;
    }

    return (
        <TemplateForm
            name={name}
            setName={setName}
            description={description}
            setDescription={setDescription}
            milestones={milestones}
            setMilestones={setMilestones}
            errors={errors}
            clearErrors={clearErrors}
            formTitle={`Edit release template`}
            formatApiCode={formatApiCode}
            handleSubmit={handleSubmit}
            loading={loading}
            archived={!!template.archivedAt}
        >
            <StyledButtonContainer>
                <UpdateButton
                    name='template'
                    permission={RELEASE_PLAN_TEMPLATE_UPDATE}
                    disabled={!!template.archivedAt}
                >
                    Save changes
                </UpdateButton>
                <StyledCancelButton onClick={handleCancel}>
                    Cancel
                </StyledCancelButton>
            </StyledButtonContainer>
        </TemplateForm>
    );
};
