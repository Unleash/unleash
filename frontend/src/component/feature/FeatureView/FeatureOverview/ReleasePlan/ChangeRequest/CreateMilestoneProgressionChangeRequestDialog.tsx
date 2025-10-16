import { Dialogue } from 'component/common/Dialogue/Dialogue';
import { styled, Button } from '@mui/material';
import type {
    IReleasePlan,
    IReleasePlanMilestone,
} from 'interfaces/releasePlans';
import type { CreateMilestoneProgressionSchema } from 'openapi';
import { getTimeValueAndUnitFromMinutes } from '../hooks/useMilestoneProgressionForm.js';

const StyledBoldSpan = styled('span')(({ theme }) => ({
    fontWeight: theme.typography.fontWeightBold,
}));

interface ICreateMilestoneProgressionChangeRequestDialogProps {
    featureId: string;
    environmentId: string;
    releasePlan?: IReleasePlan | undefined;
    sourceMilestone?: IReleasePlanMilestone | undefined;
    targetMilestone?: IReleasePlanMilestone | undefined;
    payload: CreateMilestoneProgressionSchema;
    isOpen: boolean;
    onConfirm: () => Promise<void>;
    onClosing: () => void;
}

export const CreateMilestoneProgressionChangeRequestDialog = ({
    featureId,
    environmentId,
    releasePlan,
    sourceMilestone,
    targetMilestone,
    payload,
    isOpen,
    onConfirm,
    onClosing,
}: ICreateMilestoneProgressionChangeRequestDialogProps) => {
    if (!payload) {
        return null;
    }

    const { value, unit } = getTimeValueAndUnitFromMinutes(
        payload.transitionCondition.intervalMinutes,
    );
    const progressionName = `${value} ${unit}`;

    return (
        <Dialogue
            title='Request changes'
            open={isOpen}
            secondaryButtonText='Cancel'
            onClose={onClosing}
            customButton={
                <Button
                    color='primary'
                    variant='contained'
                    onClick={onConfirm}
                    autoFocus={true}
                >
                    Add suggestion to draft
                </Button>
            }
        >
            <p>
                Create automation to proceed from{' '}
                <StyledBoldSpan>{sourceMilestone?.name}</StyledBoldSpan> to{' '}
                <StyledBoldSpan>{targetMilestone?.name}</StyledBoldSpan> after{' '}
                <StyledBoldSpan>{progressionName}</StyledBoldSpan> in{' '}
                {environmentId}
            </p>
        </Dialogue>
    );
};
