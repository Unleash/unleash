import { useUiFlag } from 'hooks/useUiFlag';
import { usePageTitle } from 'hooks/usePageTitle';
import { useRequiredPathParam } from 'hooks/useRequiredPathParam';
import { useReleasePlanTemplate } from 'hooks/api/getters/useReleasePlanTemplates/useReleasePlanTemplate';
import FormTemplate from 'component/common/FormTemplate/FormTemplate';
import { useTemplateForm } from '../hooks/useTemplateForm';
import { TemplateForm } from './TemplateForm';
import { Box, Button, Card, styled } from '@mui/material';
import { UpdateButton } from 'component/common/UpdateButton/UpdateButton';
import { ADMIN } from '@server/types/permissions';
import { useNavigate } from 'react-router-dom';
import { formatUnknownError } from 'utils/formatUnknownError';
import useToast from 'hooks/useToast';
import useReleasePlanTemplatesApi from 'hooks/api/actions/useReleasePlanTemplatesApi/useReleasePlanTemplatesApi';

const StyledForm = styled('form')(() => ({
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
}));

const StyledMilestoneCard = styled(Card)(({ theme }) => ({
    marginTop: theme.spacing(2),
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    boxShadow: 'none',
    border: `1px solid ${theme.palette.divider}`,
    [theme.breakpoints.down('sm')]: {
        justifyContent: 'center',
    },
    transition: 'background-color 0.2s ease-in-out',
    backgroundColor: theme.palette.background.default,
    '&:hover': {
        backgroundColor: theme.palette.neutral.light,
    },
    borderRadius: theme.shape.borderRadiusMedium,
}));

const StyledMilestoneCardBody = styled(Box)(({ theme }) => ({
    padding: theme.spacing(3, 2),
}));

const StyledMilestoneCardTitle = styled('span')(({ theme }) => ({
    fontWeight: theme.fontWeight.bold,
    fontSize: theme.fontSizes.bodySize,
}));

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
    const { setToastApiError } = useToast();
    const { updateReleasePlanTemplate } = useReleasePlanTemplatesApi();
    const {
        name,
        setName,
        description,
        setDescription,
        errors,
        clearErrors,
        validate,
        getTemplatePayload,
    } = useTemplateForm(template.name, template.description);

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
                    milestones: template.milestones,
                });
                navigate('/release-management');
            } catch (error: unknown) {
                setToastApiError(formatUnknownError(error));
            }
        }
    };

    if (!releasePlansEnabled) {
        return null;
    }

    return (
        <>
            <FormTemplate
                title={`Edit template ${template.name}`}
                description='Edit a release plan template that makes it easier for you and your team to release features.'
            >
                <StyledForm onSubmit={handleSubmit}>
                    <TemplateForm
                        name={name}
                        setName={setName}
                        description={description}
                        setDescription={setDescription}
                        errors={errors}
                        clearErrors={clearErrors}
                    />

                    {template.milestones.map((milestone) => (
                        <StyledMilestoneCard key={milestone.id}>
                            <StyledMilestoneCardBody>
                                <StyledMilestoneCardTitle>
                                    {milestone.name}
                                </StyledMilestoneCardTitle>
                            </StyledMilestoneCardBody>
                        </StyledMilestoneCard>
                    ))}
                    <StyledButtonContainer>
                        <UpdateButton name='template' permission={ADMIN} />
                        <StyledCancelButton onClick={handleCancel}>
                            Cancel
                        </StyledCancelButton>
                    </StyledButtonContainer>
                </StyledForm>
            </FormTemplate>
        </>
    );
};
