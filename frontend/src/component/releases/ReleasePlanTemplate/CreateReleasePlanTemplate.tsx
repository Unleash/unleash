import FormTemplate from 'component/common/FormTemplate/FormTemplate';
import { usePageTitle } from 'hooks/usePageTitle';
import { Button, styled } from '@mui/material';
import { TemplateForm } from './TemplateForm';
import { useTemplateForm } from '../hooks/useTemplateForm';
import { CreateButton } from 'component/common/CreateButton/CreateButton';
import { ADMIN } from '@server/types/permissions';
import { useNavigate } from 'react-router-dom';
import { GO_BACK } from 'constants/navigate';
import useReleasePlanTemplatesApi from 'hooks/api/actions/useReleasePlanTemplatesApi/useReleasePlanTemplatesApi';
import { scrollToTop } from 'component/common/util';
import useToast from 'hooks/useToast';
import { formatUnknownError } from 'utils/formatUnknownError';
import { useUiFlag } from 'hooks/useUiFlag';
import ReleaseTemplateIcon from '@mui/icons-material/DashboardOutlined';
import type { IReleasePlanMilestonePayload } from 'interfaces/releasePlans';
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

const StyledCancelButton = styled(Button)(({ theme }) => ({
    marginLeft: theme.spacing(3),
}));

const StyledAddMilestoneButton = styled(Button)(({ theme }) => ({
    marginTop: theme.spacing(1),
    maxWidth: theme.spacing(20),
}));

export const CreateReleasePlanTemplate = () => {
    const releasePlansEnabled = useUiFlag('releasePlans');
    usePageTitle('Create release plan template');
    const { setToastApiError, setToastData } = useToast();
    const navigate = useNavigate();
    const { createReleasePlanTemplate } = useReleasePlanTemplatesApi();
    const [milestones, setMilestones] = useState<
        IReleasePlanMilestonePayload[]
    >([{ name: 'Milestone 1', sortOrder: 0 }]);
    const [addStrategyOpen, setAddStrategyOpen] = useState<boolean>(false);
    const {
        name,
        setName,
        description,
        setDescription,
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
            const payload = getTemplatePayload();
            try {
                const template = await createReleasePlanTemplate({
                    ...payload,
                    milestones,
                });
                scrollToTop();
                setToastData({
                    type: 'success',
                    title: 'Release plan template created',
                });
                navigate(`/release-management/edit/${template.id}`);
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
            title='Create release plan template'
            documentationIcon={<ReleaseTemplateIcon />}
            description='Create a release plan template to make it easier for you and your team to release features.'
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
                    <CreateButton name='template' permission={ADMIN} />
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
