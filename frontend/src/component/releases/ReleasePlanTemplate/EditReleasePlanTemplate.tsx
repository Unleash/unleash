import { useUiFlag } from 'hooks/useUiFlag';
import { usePageTitle } from 'hooks/usePageTitle';
import { useRequiredPathParam } from 'hooks/useRequiredPathParam';
import { useReleasePlanTemplate } from 'hooks/api/getters/useReleasePlanTemplates/useReleasePlanTemplate';
import FormTemplate from 'component/common/FormTemplate/FormTemplate';
import { useTemplateForm } from '../hooks/useTemplateForm';
import { TemplateForm } from './TemplateForm';
import { Button, styled } from '@mui/material';
import { UpdateButton } from 'component/common/UpdateButton/UpdateButton';
import { ADMIN } from '@server/types/permissions';
import { useNavigate } from 'react-router-dom';
import { formatUnknownError } from 'utils/formatUnknownError';
import useToast from 'hooks/useToast';
import useReleasePlanTemplatesApi from 'hooks/api/actions/useReleasePlanTemplatesApi/useReleasePlanTemplatesApi';
import { MilestoneList } from './MilestoneList';
import { useState } from 'react';
import { SidebarModal } from 'component/common/SidebarModal/SidebarModal';
import { ReleasePlanTemplateAddStrategyForm } from './ReleasePlanTemplateAddStrategyForm';

const StyledForm = styled('form')(() => ({
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
}));

const StyledButtonContainer = styled('div')(() => ({
    marginTop: 'auto',
    display: 'flex',
    justifyContent: 'flex-end',
}));

const StyledAddMilestoneButton = styled(Button)(({ theme }) => ({
    marginTop: theme.spacing(1),
    maxWidth: theme.spacing(20),
}));

const StyledCancelButton = styled(Button)(({ theme }) => ({
    marginLeft: theme.spacing(3),
}));

export const EditReleasePlanTemplate = () => {
    const releasePlansEnabled = useUiFlag('releasePlans');
    const templateId = useRequiredPathParam('templateId');
    const [addStrategyOpen, setAddStrategyOpen] = useState<boolean>(false);
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
                navigate('/release-management');
            } catch (error: unknown) {
                setToastApiError(formatUnknownError(error));
            }
        }
    };
    const onSidebarClose = () => {};

    if (!releasePlansEnabled) {
        return null;
    }

    return (
        <FormTemplate
            title={`Edit template ${template.name}`}
            description='Edit a release plan template that makes it easier for you and your team to release features.'
            loading={loading}
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

                <MilestoneList
                    milestones={milestones}
                    setAddStrategyOpen={setAddStrategyOpen}
                    errors={errors}
                    clearErrors={clearErrors}
                />
                <StyledAddMilestoneButton
                    variant='text'
                    color='primary'
                    onClick={(e) => {
                        e.preventDefault();
                        setMilestones([
                            ...milestones,
                            {
                                name: `Milestone ${milestones.length + 1}`,
                                sortOrder: milestones.length,
                            },
                        ]);
                    }}
                >
                    + Add milestone
                </StyledAddMilestoneButton>
                <StyledButtonContainer>
                    <UpdateButton name='template' permission={ADMIN} />
                    <StyledCancelButton onClick={handleCancel}>
                        Cancel
                    </StyledCancelButton>
                </StyledButtonContainer>
            </StyledForm>
            <SidebarModal
                label='Add strategy to template milestone'
                onClose={onSidebarClose}
                open={addStrategyOpen}
            >
                <>
                    <ReleasePlanTemplateAddStrategyForm
                        onCancel={() => {
                            setAddStrategyOpen(false);
                        }}
                    />
                </>
            </SidebarModal>
        </FormTemplate>
    );
};
