import { usePageTitle } from 'hooks/usePageTitle';
import { Button, styled } from '@mui/material';
import { TemplateForm } from './TemplateForm/TemplateForm.tsx';
import { useTemplateForm } from '../hooks/useTemplateForm.ts';
import { CreateButton } from 'component/common/CreateButton/CreateButton';
import { RELEASE_PLAN_TEMPLATE_CREATE } from '@server/types/permissions';
import { useNavigate } from 'react-router-dom';
import { GO_BACK } from 'constants/navigate';
import useReleasePlanTemplatesApi from 'hooks/api/actions/useReleasePlanTemplatesApi/useReleasePlanTemplatesApi';
import { scrollToTop } from 'component/common/util';
import useToast from 'hooks/useToast';
import { formatUnknownError } from 'utils/formatUnknownError';
import useUiConfig from 'hooks/api/getters/useUiConfig/useUiConfig';
import { usePlausibleTracker } from 'hooks/usePlausibleTracker';
import { Limit } from 'component/common/Limit/Limit.tsx';
import { useReleasePlanTemplates } from 'hooks/api/getters/useReleasePlanTemplates/useReleasePlanTemplates.ts';

const StyledButtonContainer = styled('div')(() => ({
    marginTop: 'auto',
    display: 'flex',
    justifyContent: 'flex-end',
}));

const StyledCancelButton = styled(Button)(({ theme }) => ({
    marginLeft: theme.spacing(3),
}));

export const CreateReleasePlanTemplate = () => {
    const { uiConfig, isEnterprise } = useUiConfig();
    const { setToastApiError, setToastData } = useToast();
    const navigate = useNavigate();
    const { createReleasePlanTemplate } = useReleasePlanTemplatesApi();
    const { trackEvent } = usePlausibleTracker();
    const { templates } = useReleasePlanTemplates();
    const releaseTemplateLimit = uiConfig.resourceLimits.releaseTemplates;
    const canCreateMore = templates.length < releaseTemplateLimit;

    usePageTitle('Create release template');

    const {
        name,
        setName,
        description,
        setDescription,
        milestones,
        setMilestones,
        errors,
        clearErrors,
        validate,
        getTemplatePayload,
    } = useTemplateForm();

    const handleCancel = () => {
        navigate(GO_BACK);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        clearErrors();
        const isValid = validate();
        if (isValid) {
            try {
                const template = await createReleasePlanTemplate(
                    getTemplatePayload(),
                );
                scrollToTop();
                setToastData({
                    type: 'success',
                    text: !canCreateMore
                        ? 'You have reached the limit of release templates.'
                        : 'Release template created',
                    persist: !canCreateMore,
                });

                trackEvent('release-management', {
                    props: {
                        eventType: 'create-template',
                        template: template.name,
                    },
                });

                navigate('/release-templates');
            } catch (error: unknown) {
                setToastApiError(formatUnknownError(error));
            }
        }
    };

    const formatApiCode = () => `curl --location --request POST '${
        uiConfig.unleashUrl
    }/api/admin/release-plan-templates' \\
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
            formTitle='Create release template'
            formatApiCode={formatApiCode}
            handleSubmit={handleSubmit}
            Limit={
                !canCreateMore && (
                    <Limit
                        name='release templates'
                        limit={releaseTemplateLimit}
                        currentValue={templates.length}
                    />
                )
            }
        >
            <StyledButtonContainer>
                <CreateButton
                    name='template'
                    permission={RELEASE_PLAN_TEMPLATE_CREATE}
                    disabled={!canCreateMore}
                >
                    Save template
                </CreateButton>
                <StyledCancelButton onClick={handleCancel}>
                    Cancel
                </StyledCancelButton>
            </StyledButtonContainer>
        </TemplateForm>
    );
};
