import { Dialogue } from 'component/common/Dialogue/Dialogue';
import useToast from 'hooks/useToast';
import { styled, Button, Alert } from '@mui/material';
import type { IReleasePlan } from 'interfaces/releasePlans';
import { useChangeRequestApi } from 'hooks/api/actions/useChangeRequestApi/useChangeRequestApi';
import { usePendingChangeRequests } from 'hooks/api/getters/usePendingChangeRequests/usePendingChangeRequests';

const StyledBoldSpan = styled('span')(({ theme }) => ({
    fontWeight: theme.typography.fontWeightBold,
}));

interface IRemoveReleasePlanChangeRequestDialogProps {
    projectId: string;
    featureId: string;
    environmentId: string;
    releasePlan?: IReleasePlan | undefined;
    environmentActive: boolean;
    onClosing: () => void;
}

export const RemoveReleasePlanChangeRequestDialog = ({
    projectId,
    featureId,
    environmentId,
    releasePlan,
    environmentActive,
    onClosing,
}: IRemoveReleasePlanChangeRequestDialogProps) => {
    const { setToastData } = useToast();
    const { addChange } = useChangeRequestApi();
    const { refetch: refetchChangeRequests } =
        usePendingChangeRequests(projectId);

    const addRemoveReleasePlanToChangeRequest = async () => {
        addChange(projectId, environmentId, {
            feature: featureId,
            action: 'deleteReleasePlan',
            payload: {
                planId: releasePlan?.id,
            },
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
            open={Boolean(releasePlan)}
            secondaryButtonText='Cancel'
            onClose={() => {
                onClosing();
            }}
            customButton={
                <Button
                    color='primary'
                    variant='contained'
                    onClick={addRemoveReleasePlanToChangeRequest}
                    autoFocus={true}
                >
                    Add suggestion to draft
                </Button>
            }
        >
            <>
                {environmentActive && (
                    <Alert severity='error' sx={{ mb: 2 }}>
                        This release plan currently has one active milestone.
                        Removing the release plan will change which users
                        receive access to the feature.
                    </Alert>
                )}
                <p>
                    <StyledBoldSpan>Remove</StyledBoldSpan> release plan{' '}
                    <StyledBoldSpan>{releasePlan?.name}</StyledBoldSpan> from{' '}
                    <StyledBoldSpan>{featureId}</StyledBoldSpan> in{' '}
                    <StyledBoldSpan>{environmentId}</StyledBoldSpan>
                </p>
            </>
        </Dialogue>
    );
};
