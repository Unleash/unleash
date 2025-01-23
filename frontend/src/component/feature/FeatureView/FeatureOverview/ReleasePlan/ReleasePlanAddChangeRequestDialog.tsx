import { Dialogue } from 'component/common/Dialogue/Dialogue';
import { useRequiredPathParam } from 'hooks/useRequiredPathParam';
import { useRequiredQueryParam } from 'hooks/useRequiredQueryParam';
import { formatFeaturePath } from 'component/feature/FeatureStrategy/FeatureStrategyEdit/FeatureStrategyEdit';
import { useNavigate } from 'react-router-dom';
import { useReleasePlanTemplate } from 'hooks/api/getters/useReleasePlanTemplates/useReleasePlanTemplate';
import useToast from 'hooks/useToast';
import { styled, Button } from '@mui/material';

const StyledBoldSpan = styled('span')(({ theme }) => ({
    fontWeight: theme.typography.fontWeightBold,
}));

export const ReleasePlanAddChangeRequestDialog = () => {
    const navigate = useNavigate();
    const projectId = useRequiredPathParam('projectId');
    const featureId = useRequiredPathParam('featureId');
    const environmentId = useRequiredQueryParam('environmentId');
    const releaseTemplateId = useRequiredQueryParam('releaseTemplateId');
    const template = useReleasePlanTemplate(releaseTemplateId);
    const { setToastApiError, setToastData } = useToast();

    if (template.error) {
        navigate(formatFeaturePath(projectId, featureId));
    }

    const onClose = () => {
        navigate(formatFeaturePath(projectId, featureId));
    };

    const addReleasePlanToChangeRequest = async () => {
        setToastData({
            type: 'success',
            text: 'Added to draft',
        });
        onClose();
    };

    return (
        <Dialogue
            title='Request changes'
            open={true}
            secondaryButtonText='Cancel'
            onClose={onClose}
            customButton={
                <Button
                    color='primary'
                    variant='contained'
                    onClick={addReleasePlanToChangeRequest}
                    autoFocus={true}
                >
                    Add suggestion to draft
                </Button>
            }
        >
            <p>
                <StyledBoldSpan>Add</StyledBoldSpan> release template{' '}
                <StyledBoldSpan>{template.template.name}</StyledBoldSpan> to{' '}
                <StyledBoldSpan>{featureId}</StyledBoldSpan> in{' '}
                <StyledBoldSpan>{environmentId}</StyledBoldSpan>
            </p>
        </Dialogue>
    );
};

export const formatReleasePlanChangeRequestPath = (
    projectId: string,
    featureId: string,
    environmentId: string,
    releaseTemplateId: string,
) => {
    const params = new URLSearchParams({
        environmentId,
        releaseTemplateId,
    });

    return `/projects/${projectId}/features/${featureId}/release-plan/add?${params}`;
};
