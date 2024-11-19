import { usePageTitle } from 'hooks/usePageTitle';
import { Button, styled } from '@mui/material';
import { TemplateForm } from './TemplateForm';
import { useTemplateForm } from '../hooks/useTemplateForm';
import { CreateButton } from 'component/common/CreateButton/CreateButton';
import { RELEASE_PLAN_TEMPLATE_CREATE } from '@server/types/permissions';
import { useNavigate } from 'react-router-dom';
import { GO_BACK } from 'constants/navigate';
import useReleasePlanTemplatesApi from 'hooks/api/actions/useReleasePlanTemplatesApi/useReleasePlanTemplatesApi';
import { scrollToTop } from 'component/common/util';
import useToast from 'hooks/useToast';
import { formatUnknownError } from 'utils/formatUnknownError';
import { useUiFlag } from 'hooks/useUiFlag';

const StyledButtonContainer = styled('div')(() => ({
    marginTop: 'auto',
    display: 'flex',
    justifyContent: 'flex-end',
}));

const StyledCancelButton = styled(Button)(({ theme }) => ({
    marginLeft: theme.spacing(3),
}));

export const CreateReleasePlanTemplate = () => {
    const releasePlansEnabled = useUiFlag('releasePlans');
    const { setToastApiError, setToastData } = useToast();
    const navigate = useNavigate();
    const { createReleasePlanTemplate } = useReleasePlanTemplatesApi();
    usePageTitle('Create release plan template');
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

    if (!releasePlansEnabled) {
        return null;
    }

    return (
        <TemplateForm
            mode='create'
            name={name}
            setName={setName}
            description={description}
            setDescription={setDescription}
            milestones={milestones}
            setMilestones={setMilestones}
            errors={errors}
            clearErrors={clearErrors}
            formTitle='Create release plan template'
            formDescription='Create a release plan template to make it easier for you and your team to release features.'
            handleSubmit={handleSubmit}
        >
            <StyledButtonContainer>
                <CreateButton
                    name='template'
                    permission={RELEASE_PLAN_TEMPLATE_CREATE}
                />
                <StyledCancelButton onClick={handleCancel}>
                    Cancel
                </StyledCancelButton>
            </StyledButtonContainer>
        </TemplateForm>
    );
};
