import { useUiFlag } from 'hooks/useUiFlag';
import { usePageTitle } from 'hooks/usePageTitle';
import { useRequiredPathParam } from 'hooks/useRequiredPathParam';
import { useReleasePlanTemplate } from 'hooks/api/getters/useReleasePlanTemplates/useReleasePlanTemplate';
import { useTemplateForm } from '../hooks/useTemplateForm';
import { TemplateForm } from './TemplateForm';
import { Button, styled } from '@mui/material';
import { UpdateButton } from 'component/common/UpdateButton/UpdateButton';
import { RELEASE_PLAN_TEMPLATE_UPDATE } from '@server/types/permissions';
import { useNavigate } from 'react-router-dom';
import { formatUnknownError } from 'utils/formatUnknownError';
import useToast from 'hooks/useToast';
import useReleasePlanTemplatesApi from 'hooks/api/actions/useReleasePlanTemplatesApi/useReleasePlanTemplatesApi';

const StyledButtonContainer = styled('div')(() => ({
    marginTop: 'auto',
    display: 'flex',
    justifyContent: 'flex-end',
}));

const StyledCancelButton = styled(Button)(({ theme }) => ({
    marginLeft: theme.spacing(3),
}));

export const EditReleasePlanTemplate = () => {
    const releasePlansEnabled = useUiFlag('releasePlans');
    const templateId = useRequiredPathParam('templateId');
    const { template, loading, error, refetch } =
        useReleasePlanTemplate(templateId);
    usePageTitle(`Edit template: ${template.name}`);
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
        navigate('/release-management');
    };
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        clearErrors();
        const isValid = validate();
        if (isValid) {
            const payload = getTemplatePayload();
            try {
                await updateReleasePlanTemplate({
                    ...payload,
                    id: templateId,
                    milestones,
                });
                await refetch();
                setToastData({
                    type: 'success',
                    title: 'Release plan template updated',
                });
            } catch (error: unknown) {
                setToastApiError(formatUnknownError(error));
            }
        }
    };

    if (!releasePlansEnabled) {
        return null;
    }

    return (
        <TemplateForm
            mode='edit'
            name={name}
            setName={setName}
            description={description}
            setDescription={setDescription}
            milestones={milestones}
            setMilestones={setMilestones}
            errors={errors}
            clearErrors={clearErrors}
            formTitle={`Edit template ${template.name}`}
            formDescription='Edit a release plan template that makes it easier for you and your team to release features.'
            handleSubmit={handleSubmit}
            loading={loading}
        >
            <StyledButtonContainer>
                <UpdateButton
                    name='template'
                    permission={RELEASE_PLAN_TEMPLATE_UPDATE}
                />
                <StyledCancelButton onClick={handleCancel}>
                    Cancel
                </StyledCancelButton>
            </StyledButtonContainer>
        </TemplateForm>
    );
};
