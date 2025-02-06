import { Dialogue } from 'component/common/Dialogue/Dialogue';
import useToast from 'hooks/useToast';
import { styled, Button } from '@mui/material';
import type {
    IReleasePlan,
    IReleasePlanMilestone,
} from 'interfaces/releasePlans';
import { useChangeRequestApi } from 'hooks/api/actions/useChangeRequestApi/useChangeRequestApi';
import { usePendingChangeRequests } from 'hooks/api/getters/usePendingChangeRequests/usePendingChangeRequests';

const StyledBoldSpan = styled('span')(({ theme }) => ({
    fontWeight: theme.typography.fontWeightBold,
}));

interface IStartMilestoneChangeRequestDialogProps {
    projectId: string;
    featureId: string;
    environmentId: string;
    releasePlan?: IReleasePlan | undefined;
    milestone?: IReleasePlanMilestone | undefined;
    environmentActive?: boolean;
    onClosing: () => void;
}

export const StartMilestoneChangeRequestDialog = ({
    projectId,
    featureId,
    environmentId,
    releasePlan,
    milestone,
    environmentActive,
    onClosing,
}: IStartMilestoneChangeRequestDialogProps) => {
    const { setToastData } = useToast();
    const { addChange } = useChangeRequestApi();
    const { refetch: refetchChangeRequests } =
        usePendingChangeRequests(projectId);

    const addStartMilestoneToChangeRequest = async () => {
        addChange(projectId, environmentId, {
            feature: featureId,
            action: 'startMilestone',
            payload: {
                planId: releasePlan?.id,
                milestoneId: releasePlan?.milestones[0].id,
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
                    onClick={addStartMilestoneToChangeRequest}
                    autoFocus={true}
                >
                    Add suggestion to draft
                </Button>
            }
        >
            <p>
                <StyledBoldSpan>Start</StyledBoldSpan> milestone{' '}
                <StyledBoldSpan>{milestone?.name}</StyledBoldSpan> in release
                plan <StyledBoldSpan>{releasePlan?.name}</StyledBoldSpan> for{' '}
                <StyledBoldSpan>{featureId}</StyledBoldSpan> in{' '}
                <StyledBoldSpan>{environmentId}</StyledBoldSpan>
            </p>
        </Dialogue>
    );
};
