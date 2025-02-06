import { Dialogue } from 'component/common/Dialogue/Dialogue';
import { styled, Button } from '@mui/material';
import type {
    IReleasePlan,
    IReleasePlanMilestone,
} from 'interfaces/releasePlans';

const StyledBoldSpan = styled('span')(({ theme }) => ({
    fontWeight: theme.typography.fontWeightBold,
}));

interface IStartMilestoneChangeRequestDialogProps {
    featureId: string;
    environmentId: string;
    releasePlan?: IReleasePlan | undefined;
    milestone?: IReleasePlanMilestone | undefined;
    isOpen: boolean;
    onConfirm: () => Promise<void>;
    onClosing: () => void;
}

export const StartMilestoneChangeRequestDialog = ({
    featureId,
    environmentId,
    releasePlan,
    milestone,
    isOpen,
    onConfirm,
    onClosing,
}: IStartMilestoneChangeRequestDialogProps) => {
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
                <StyledBoldSpan>Start</StyledBoldSpan> milestone{' '}
                <StyledBoldSpan>{milestone?.name}</StyledBoldSpan> in release
                plan <StyledBoldSpan>{releasePlan?.name}</StyledBoldSpan> for{' '}
                <StyledBoldSpan>{featureId}</StyledBoldSpan> in{' '}
                <StyledBoldSpan>{environmentId}</StyledBoldSpan>
            </p>
        </Dialogue>
    );
};
