import { Dialogue } from 'component/common/Dialogue/Dialogue';
import useToast from 'hooks/useToast';
import { styled, Button } from '@mui/material';
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

    const addReleasePlanToChangeRequest = async () => {
        addChange(projectId, environmentId, {
            feature: featureId,
            action: 'addReleasePlan',
            payload: {
                templateId: releaseTemplate?.id,
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
            <p>
                <StyledBoldSpan>Add</StyledBoldSpan> release template{' '}
                <StyledBoldSpan>{releaseTemplate?.name}</StyledBoldSpan> to{' '}
                <StyledBoldSpan>{featureId}</StyledBoldSpan> in{' '}
                <StyledBoldSpan>{environmentId}</StyledBoldSpan>
            </p>
        </Dialogue>
    );
};
