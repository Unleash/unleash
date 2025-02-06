import { Dialogue } from 'component/common/Dialogue/Dialogue';
import useToast from 'hooks/useToast';
import { styled, Button, Alert } from '@mui/material';
import type {
    IReleasePlan,
    IReleasePlanMilestone,
    IReleasePlanTemplate,
} from 'interfaces/releasePlans';
import { useChangeRequestApi } from 'hooks/api/actions/useChangeRequestApi/useChangeRequestApi';
import { usePendingChangeRequests } from 'hooks/api/getters/usePendingChangeRequests/usePendingChangeRequests';

const StyledBoldSpan = styled('span')(({ theme }) => ({
    fontWeight: theme.typography.fontWeightBold,
}));

interface IReleasePlanAddChangeRequestDialogProps {
    action: 'addReleasePlan' | 'deleteReleasePlan' | 'startMilestone';
    projectId: string;
    featureId: string;
    environmentId: string;
    releaseTemplate?: IReleasePlanTemplate | undefined;
    releasePlan?: IReleasePlan | undefined;
    milestone?: IReleasePlanMilestone | undefined;
    environmentActive?: boolean;
    onClosing: () => void;
}

export const ReleasePlanAddChangeRequestDialog = ({
    action,
    projectId,
    featureId,
    environmentId,
    releaseTemplate,
    releasePlan,
    milestone,
    environmentActive,
    onClosing,
}: IReleasePlanAddChangeRequestDialogProps) => {
    const { setToastData } = useToast();
    const { addChange } = useChangeRequestApi();
    const { refetch: refetchChangeRequests } =
        usePendingChangeRequests(projectId);

    const getPayload = () => {
        if (action === 'addReleasePlan') {
            return {
                templateId: releaseTemplate?.id,
            };
        }
        if (action === 'deleteReleasePlan') {
            return {
                planId: releasePlan?.id,
            };
        }
        if (action === 'startMilestone') {
            return {
                planId: releasePlan?.id,
                milestoneId: releasePlan?.milestones[0].id,
            };
        }
    };

    const addReleasePlanToChangeRequest = async () => {
        addChange(projectId, environmentId, {
            feature: featureId,
            action,
            payload: getPayload(),
        });

        refetchChangeRequests();

        setToastData({
            type: 'success',
            text: 'Added to draft',
        });
        onClosing();
    };

    return (
        <Dialogue
            title='Request changes'
            open={Boolean(releaseTemplate) || Boolean(releasePlan)}
            secondaryButtonText='Cancel'
            onClose={() => {
                onClosing();
            }}
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
            {action === 'addReleasePlan' && (
                <p>
                    <StyledBoldSpan>Add</StyledBoldSpan> release template{' '}
                    <StyledBoldSpan>{releaseTemplate?.name}</StyledBoldSpan> to{' '}
                    <StyledBoldSpan>{featureId}</StyledBoldSpan> in{' '}
                    <StyledBoldSpan>{environmentId}</StyledBoldSpan>
                </p>
            )}
            {action === 'deleteReleasePlan' && (
                <>
                    {environmentActive && (
                        <Alert severity='error' sx={{ mb: 2 }}>
                            This release plan currently has one active
                            milestone. Removing the release plan will change
                            which users receive access to the feature.
                        </Alert>
                    )}
                    <p>
                        <StyledBoldSpan>Remove</StyledBoldSpan> release plan{' '}
                        <StyledBoldSpan>{releasePlan?.name}</StyledBoldSpan>{' '}
                        from <StyledBoldSpan>{featureId}</StyledBoldSpan> in{' '}
                        <StyledBoldSpan>{environmentId}</StyledBoldSpan>
                    </p>
                </>
            )}
            {action === 'startMilestone' && (
                <p>
                    <StyledBoldSpan>Start</StyledBoldSpan> milestone{' '}
                    <StyledBoldSpan>{milestone?.name}</StyledBoldSpan> in
                    release plan{' '}
                    <StyledBoldSpan>{releasePlan?.name}</StyledBoldSpan> for{' '}
                    <StyledBoldSpan>{featureId}</StyledBoldSpan> in{' '}
                    <StyledBoldSpan>{environmentId}</StyledBoldSpan>
                </p>
            )}
        </Dialogue>
    );
};
